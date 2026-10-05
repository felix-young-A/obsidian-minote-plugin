/**
 * @file 小米笔记 API 代理（移动端适配）
 * @author Emac（原作者），移动端适配：felix-young-A
 * @date 2025-01-05
 */
// 本文件改编自 Emac Shen 的 obsidian-minote-plugin（MIT 协议）。
// 移动端适配改动：增加状态码与非 JSON 响应校验，Accept-Encoding 改为 identity。
import { requestUrl, type RequestUrlParam } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from './settings';

export default class MinoteApi {

	private getBaseUrl() {
		return `https://${get(settingsStore).host}`;
	}

	private getHeaders() {
		return {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'Accept-Encoding': 'identity',
			Accept: 'application/json, text/plain, */*',
			'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
			'Cookie': get(settingsStore).cookie
		};
	}

	private parseJson(text: string, label: string) {
		try {
			return JSON.parse(text);
		} catch (err) {
			const hex = Array.from(text.slice(0, 32))
				.map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
				.join(' ');
			const preview = text.replace(/[^\x20-\x7E]/g, '\uFFFD').slice(0, 80);
			throw new Error(`${label}返回内容非JSON（预览: "${preview}"；前32字节hex: ${hex}）`);
		}
	}

	async fetchPage(syncTag = '') {
		const req: RequestUrlParam = {
			url: this.getBaseUrl() + `/note/full/page?ts=${Date.now()}&syncTag=${syncTag}&limit=200`,
			method: 'GET',
			headers: this.getHeaders()
		};
		const resp = await requestUrl(req);
		if (resp.status !== 200) {
			throw new Error(
				`同步接口返回异常状态码 ${resp.status}${
					resp.status === 401 || resp.status === 403 ? '（Cookie 可能无效或已被风控）' : ''
				}`
			);
		}
		const page = this.parseJson(resp.text, '同步接口');
		if (!page || !page.data) {
			throw new Error(`同步接口返回内容异常：${String(page).slice(0, 120)}`);
		}
		return page;
	}

	async fetchNoteDetails(noteId: string) {
		const req: RequestUrlParam = {
			url: this.getBaseUrl() + `/note/note/${noteId}/?ts=${Date.now()}`,
			method: 'GET',
			headers: this.getHeaders()
		};
		const resp = await requestUrl(req);
		if (resp.status !== 200) {
			throw new Error(`笔记详情接口返回异常状态码 ${resp.status}`);
		}
		return this.parseJson(resp.text, '笔记详情接口');
	}

	async fetchImage(fileId: string) {
		const req: RequestUrlParam = {
			url: this.getBaseUrl() + `/file/full?type=note_img&fileid=${fileId}`,
			method: 'GET',
			headers: this.getHeaders()
		};
		const resp = await requestUrl(req);
		return resp.arrayBuffer;
	}
}
