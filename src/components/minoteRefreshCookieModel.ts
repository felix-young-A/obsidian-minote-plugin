/**
 * @file 刷新Cookie页面（移动端适配）
 * @author Emac（原作者），移动端适配：felix-young-A
 * @date 2025-01-18
 */
// 本文件改编自 Emac Shen 的 obsidian-minote-plugin（MIT 协议）。
// 移动端适配改动：引导重新粘贴 Cookie，替代 Electron BrowserWindow。
import { Modal, Setting } from 'obsidian';

import { MinoteSettingTab } from '../settingTab';
import MinoteLoginModel from './minoteLoginModel';

export default class MinoteRefreshCookieModel extends Modal {
	private settingTab: MinoteSettingTab;

	constructor(settingTab: MinoteSettingTab) {
		super(settingTab.plugin.app);
		this.settingTab = settingTab;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl('h3', { text: '刷新 Cookie' });
		contentEl.createEl('p', {
			text: '当前 Cookie 已失效或即将失效，需要重新登录小米云服务并粘贴新的 Cookie。'
		});

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText('去粘贴新 Cookie')
					.setCta()
					.onClick(() => {
						this.close();
						new MinoteLoginModel(this.settingTab).open();
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
