/**
 * @file 跨端平台工具（移动端兼容）
 * @author Marvis adapted from Emac
 * @date 2026-10-05
 *
 * 设计约束：
 * 1. 本文件顶层禁止引入任何 Node.js 模块（fs/path/electron），
 *    否则 esbuild 打包后在 Obsidian 移动端加载 main.js 时会直接崩溃。
 * 2. Node 专属能力（设置文件时间戳）仅在 Platform.isDesktopApp 为真时
 *    通过动态 require 使用，移动端自动跳过。
 */
import { Platform } from 'obsidian';

/**
 * 拼接 Vault 内相对路径。
 * Obsidian 在桌面端与移动端统一使用 '/' 作为 Vault 内路径分隔符，
 * 因此直接用 '/' 拼接并交给 normalizePath 规范化即可，不依赖 Node path 模块。
 */
export function joinPath(...parts: string[]): string {
    return parts.filter(Boolean).join('/');
}

/**
 * 设置文件时间戳（创建时间 / 修改时间）。
 * - 桌面端：通过 Node fs.utimesSync 设置，保留原插件“保留笔记时间”的特性；
 * - 移动端：Obsidian 移动端不提供修改文件系统时间戳的 API，自动跳过，
 *   不影响同步内容本身。
 */
export function setFileTimes(adapter: any, vaultPath: string, createDate: number, modifyDate: number): void {
    if (!Platform.isDesktopApp) {
        return;
    }
    try {
        const absolutePath = adapter.getFullPath(vaultPath);
        // 动态 require：仅桌面端执行到这里，移动端不会加载 Node fs
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs');
        fs.utimesSync(absolutePath, createDate / 1000, modifyDate / 1000);
    } catch (err) {
        console.error('[minote plugin] failed to set file times', err);
    }
}
