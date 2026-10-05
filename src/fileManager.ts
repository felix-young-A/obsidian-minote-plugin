/**
 * @file Vault 文件管理器（移动端适配）
 * @author Emac（原作者），移动端适配：felix-young-A
 * @date 2025-01-05
 */
// 本文件改编自 Emac Shen 的 obsidian-minote-plugin（MIT 协议）。
// 移动端适配改动：改用 normalizePath 与跨端 vault.adapter API，文件时间戳仅桌面端设置。
import { normalizePath, Platform } from 'obsidian';
import type { Vault, MetadataCache, DataAdapter } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from './settings';

export const joinPath = (...parts: string[]) => parts.filter(Boolean).join('/');

function setFileTimes(adapter: DataAdapter, fullPath: string, createDate: number, modifyDate: number) {
	if (!Platform.isDesktopApp) {
		return;
	}

	try {
		const absolutePath = adapter.getFullPath(fullPath);
		require('fs').utimesSync(absolutePath, createDate / 1000, createDate / 1000);
	} catch (err) {
		console.error('[minote plugin] failed to set file times', err);
	}
}

export default class FileManager {
	private vault: Vault;
	private metadataCache: MetadataCache;

	constructor(vault: Vault, metadataCache: MetadataCache) {
		this.vault = vault;
		this.metadataCache = metadataCache;
		// 创建默认文件夹（如果不存在）
		this.createFolder("", Date.now());
	}

	private fullPath(filePath: string) {
		return normalizePath(joinPath(get(settingsStore).noteLocation, filePath));
	}

	async exists(filePath: string) {
		if (!filePath) {
			return false;
		}

		return this.vault.adapter.exists(this.fullPath(filePath));
	}

	async createFolder(folderPath: string, createDate: number) {
		if (!folderPath || await this.exists(folderPath)) {
			return;
		}

		const fullPath = this.fullPath(folderPath);
		await this.vault.createFolder(fullPath);
		setFileTimes(this.vault.adapter, fullPath, createDate, createDate);
	}

	async renameFolder(oldPath: string, newPath: string) {
		if (!oldPath || !newPath) {
			return;
		}

		if (await !this.exists(oldPath) || await this.exists(newPath)) {
			return;
		}

		this.vault.adapter.rename(this.fullPath(oldPath), this.fullPath(newPath));
	}

	async deleteFile(filePath: string) {
		if (!filePath || !await this.exists(filePath)) {
			return;
		}

		this.vault.adapter.remove(this.fullPath(filePath));
	}

	async saveFile(filePath: string, content: string, createDate: number, modifyDate: number) {
		if (!filePath) {
			return;
		}

		const fullPath = this.fullPath(filePath);
		await this.vault.adapter.write(fullPath, content);
		setFileTimes(this.vault.adapter, fullPath, createDate, modifyDate);
	}

	async saveBinaryFile(filePath: string, binary: ArrayBuffer) {
		if (!filePath) {
			return;
		}

		this.vault.adapter.writeBinary(this.fullPath(filePath), binary);
	}
}
