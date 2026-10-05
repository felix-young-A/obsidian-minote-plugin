/**
 * @file 插件配置页面（跨端版）
 * @author Emac / Marvis
 * @date 2025-01-05 / 2026-10-05
 */
import { PluginSettingTab, Setting, Notice } from 'obsidian';
import type { App } from 'obsidian';
import { get } from 'svelte/store';

import MinotePlugin from 'main';
import { settingsStore } from './settings';
import MinoteLoginModel from './components/minoteLoginModel';
import MinoteLogoutModel from './components/minoteLogoutModel';
import MinoteRefreshCookieModel from './components/minoteRefreshCookieModel';

export class MinoteSettingTab extends PluginSettingTab {
	plugin: MinotePlugin;

	constructor(app: App, plugin: MinotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const isCookieValid = get(settingsStore).isCookieValid;
		if (isCookieValid) {
			this.showLogout();
		} else {
			this.showLogin();
		}

		this.syncActions();
		this.notebookFolder();
		this.advancedSettings();
	}

	private showLogin(): void {
		new Setting(this.containerEl)
			.setName('登录小米云服务')
			.setDesc('使用浏览器登录小米云服务后，复制 Cookie 粘贴回插件完成登录（桌面端与移动端通用）')
			.addButton((button) => {
				return button
					.setButtonText('登录')
					.setCta()
					.onClick(() => {
						new MinoteLoginModel(this).open();
					});
			});
	}

	private showLogout(): void {
		new Setting(this.containerEl)
			.setName(`小米云服务已登录，用户名：  ${get(settingsStore).user}`)
			.setDesc('Cookie 失效时点击【刷新Cookie】重新粘贴；需要退出登录请点击【注销】')
			.addButton((button) => {
				return button
					.setButtonText('刷新Cookie')
					.setCta()
					.onClick(() => {
						new MinoteRefreshCookieModel(this).open();
					});
			})
			.addButton((button) => {
				return button
					.setButtonText('注销')
					.setWarning()
					.onClick(() => {
						new MinoteLogoutModel(this).open();
					});
			});
	}

	private syncActions(): void {
		new Setting(this.containerEl)
			.setName('同步操作')
			.setDesc('增量同步只更新有变化的笔记；强制同步会全量覆盖更新（首次使用建议强制同步）')
			.addButton((button) => {
				return button
					.setButtonText('增量同步')
					.setCta()
					.onClick(() => {
						this.plugin.startSync(false);
					});
			})
			.addButton((button) => {
				return button
					.setButtonText('强制同步')
					.setCta()
					.onClick(() => {
						this.plugin.startSync(true);
					});
			});
	}

	private notebookFolder(): void {
		new Setting(this.containerEl)
			.setName('笔记保存位置')
			.setDesc('请选择Obsidian Vault中小米笔记存放的位置')
			.addDropdown((dropdown) => {
				const folders = this.app.vault.getAllLoadedFiles()
					.filter((f: any) => f.children !== undefined && f.path !== '/')
					.map((f: any) => f.path);
				folders.forEach((val) => {
					dropdown.addOption(val, val);
				});

				return dropdown
					.setValue(get(settingsStore).noteLocation)
					.onChange(async (value) => {
						settingsStore.actions.setNoteLocationFolder(value);
					});
			});
	}

	private advancedSettings(): void {
		this.containerEl.createEl("hr");
		const advancedSettings = this.containerEl.createEl("details");
		advancedSettings.createEl("summary", {
		  text: ("高级设置")
		});

		new Setting(advancedSettings)
			.setName('小米云服务域名')
			.addDropdown((dropdown) => {
				const hosts = ['i.mi.com', 'eu.i.mi.com', 'us.i.mi.com', 'in.i.mi.com'];
				hosts.forEach((val) => {
					dropdown.addOption(val, val);
				});

				return dropdown
					.setValue(get(settingsStore).host)
					.onChange(async (value) => {
						settingsStore.actions.setHost(value);
					});
			});

		new Setting(advancedSettings)
			.setName('本地调试')
			.addButton((button) => {
				return button
					.setButtonText('拷贝Settings')
					.setCta()
					.onClick(async () => {
						navigator.clipboard.writeText(JSON.stringify(get(settingsStore))).then(
							function () {
								new Notice('拷贝Settings到剪切板成功！');
							},
							function (error) {
								new Notice('拷贝Settings到剪切板失败！');
								console.error('[minote plugin] failed to copy settings to clipboard', error);
							}
						);
					});
			});
	}
}
