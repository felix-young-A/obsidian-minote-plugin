/**
 * @file 跨端工具函数（移动端适配新增）
 * @author Emac（原作者），移动端适配：felix-young-A
 * @date 2025-01-05
 */
// 本文件基于 Emac Shen 的 obsidian-minote-plugin（MIT 协议），为移动端适配新增。
import { Platform } from 'obsidian';
import type { DataAdapter } from 'obsidian';

export function joinPath(...parts: string[]) {
	return parts.filter(Boolean).join('/');
}

export function setFileTimes(adapter: DataAdapter, fullPath: string, createDate: number, modifyDate: number) {
	if (!Platform.isDesktopApp) {
		return;
	}

	try {
		const absolutePath = (adapter as any).getFullPath(fullPath);
		require('fs').utimesSync(absolutePath, createDate / 1000, modifyDate / 1000);
	} catch (err) {
		console.error('[minote plugin] failed to set file times', err);
	}
}
