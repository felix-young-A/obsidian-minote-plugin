/**
 * @file Vault 文件管理器（跨端版）
 * @author Emac / Marvis
 * @date 2025-01-05 / 2026-10-05
 */
import { normalizePath } from 'obsidian';
import type { Vault, MetadataCache } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from './settings';
import { joinPath, setFileTimes } from './platform';

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
