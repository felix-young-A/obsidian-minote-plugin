/**
 * @file 注销页面（移动端适配）
 * @author Emac（原作者），移动端适配：felix-young-A
 * @date 2025-01-05
 */
// 本文件改编自 Emac Shen 的 obsidian-minote-plugin（MIT 协议）。
// 移动端适配改动：用确认弹窗替代 Electron BrowserWindow 注销流程。
import { Modal, Notice, Setting } from 'obsidian';

import { settingsStore } from '../settings';
import { MinoteSettingTab } from '../settingTab';

export default class MinoteLogoutModel extends Modal {
	private settingTab: MinoteSettingTab;

	constructor(settingTab: MinoteSettingTab) {
		super(settingTab.plugin.app);
		this.settingTab = settingTab;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h3', { text: '注销小米云服务' });
		contentEl.createEl('p', { text: '确认清除本插件保存的小米云 Cookie 并退出登录？' });
		contentEl.createEl('p', {
			text: '提示：如需彻底注销小米账号的云端会话，请在浏览器登录 https://i.mi.com 后点击右上角头像退出。'
		});

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText('确认注销')
					.setWarning()
					.onClick(() => {
						settingsStore.actions.clearCookie();
						new Notice('已注销登录');
						this.settingTab.display();
						this.close();
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

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
