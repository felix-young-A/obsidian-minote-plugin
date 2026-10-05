/**
 * @file 登录（Cookie 粘贴版，跨端可用）
 * @author Marvis adapted from Emac
 * @date 2026-10-05
 *
 * 移动端没有 Electron，无法弹出浏览器窗口扫码登录。
 * 改用「外部浏览器登录小米云服务 → 复制 Cookie → 粘贴回插件」的方式，
 * 桌面端与移动端通用。
 */
import { Modal, Notice, Setting, requestUrl } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from '../settings';
import { MinoteSettingTab } from '../settingTab';

export default class MinoteLoginModel extends Modal {
	private settingTab: MinoteSettingTab;
	private cookieValue = '';
	private saving = false;

	constructor(settingTab: MinoteSettingTab) {
		super(settingTab.plugin.app);
		this.settingTab = settingTab;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h3', { text: '登录小米云服务' });

		const steps = contentEl.createEl('div');
		steps.createEl('p', { text: '第 1 步：在电脑或手机浏览器打开 https://i.mi.com/note/h5 ，登录你的小米账号（支持扫码登录）。' });
		steps.createEl('p', { text: '第 2 步：登录成功后，打开浏览器开发者工具（F12），找到 Application（应用）→ Cookies → 选择 i.mi.com，复制全部 Cookie 内容。' });
		steps.createEl('p', { text: '第 3 步：把复制的 Cookie 粘贴到下方输入框（格式形如 xxx=yyy; aaa=bbb），点击【保存并验证】。' });
		steps.createEl('p', { text: '提示：若浏览器里看不到 Cookie，可先访问一次 https://i.mi.com/note/h5 再刷新开发者工具。' });

		new Setting(contentEl)
			.setName('Cookie')
			.setDesc('粘贴小米云服务的 Cookie，多个键值对之间用分号加空格分隔')
			.addTextArea((textarea) => {
				textarea.setPlaceholder('粘贴 Cookie 到这里…');
				textarea.setValue(this.cookieValue);
				textarea.onChange((value) => {
					this.cookieValue = value.trim();
				});
				return textarea;
			});

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText('保存并验证')
					.setCta()
					.onClick(async () => {
						await this.saveCookie();
					})
			)
			.addButton((button) =>
				button
					.setButtonText('取消')
					.onClick(() => {
						this.close();
					})
			);
	}

	private async saveCookie() {
		if (this.saving) {
			return;
		}
		if (!this.cookieValue) {
			new Notice('请先粘贴 Cookie');
			return;
		}

		this.saving = true;
		try {
			// 先验证、后写入：验证失败时不覆盖/清空已有 Cookie，避免误删有效登录态
			const host = get(settingsStore).host;
			const resp = await requestUrl({
				url: `https://${host}/status/lite/profile?ts=${Date.now()}`,
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
					'Accept-Language': 'zh-CN,zh;q=0.9',
					'Cookie': this.cookieValue,
				},
			});

			if (resp.status === 200 && resp.json?.data?.nickname) {
				settingsStore.actions.setCookie(this.cookieValue);
				settingsStore.actions.setUser(resp.json.data.nickname);
				new Notice(`登录成功，用户名：${resp.json.data.nickname}`);
				this.settingTab.display();
				this.close();
			} else {
				new Notice('Cookie 无效或已过期，请重新登录后复制');
			}
		} catch (err) {
			new Notice('验证失败，请检查网络或 Cookie 是否正确');
			console.error('[minote plugin] failed to verify cookie', err);
		} finally {
			this.saving = false;
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
