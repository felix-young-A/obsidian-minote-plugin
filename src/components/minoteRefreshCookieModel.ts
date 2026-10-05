/**
 * @file 刷新 Cookie（跨端版）
 * @author Marvis adapted from Emac
 * @date 2026-10-05
 *
 * Cookie 过期后，引导用户重新登录并粘贴新的 Cookie。
 */
import { Modal, Notice, Setting } from 'obsidian';

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
		contentEl.createEl('p', { text: '当前 Cookie 已失效或即将失效，需要重新登录小米云服务并粘贴新的 Cookie。' });

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
