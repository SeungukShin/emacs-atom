'use babel';

import * as path from 'path';
import * as fs from 'fs';
import { CompositeDisposable } from 'atom';
import Log from './log';
import SelectListView from 'atom-select-list';

export default class FindFileView {
	disposables: CompositeDisposable;
	selectList: SelectListView;
	panel: Panel;
	currDirectory: String;
	addIconToElement: Function;
	prevElement: Element;

	constructor() {
		this.disposables = new CompositeDisposable();
		this.selectList = new SelectListView({
			items: [],
			filterKeyForItem: item => item.name,
			elementForItem: this.elementForItem.bind(this),
			didChangeQuery: this.query.bind(this),
			didConfirmSelection: this.select.bind(this),
			didConfirmEmptySelection: this.input.bind(this),
			didCancelSelection: this.hide.bind(this)
		});
	}

	destroy() {
		this.hide();
		this.selectList.destroy();
		this.disposables.dispose();
		this.addIconToElement = null;
	}

	elementForItem(item, { index, selected, visible }): void {
		const li = document.createElement('li');
		li.style.paddingTop = '0px';
		li.style.paddingBottom = '0px';
		if (!visible) {
			return li;
		}

		const icon = document.createElement('span');
		icon.classList.add('left');
		if (this.addIconToElement) {
			const i = document.createElement('span');
			const disposable = this.addIconToElement(i, path.join(this.currDirectory, item.name));
			this.disposables.add(disposable);
			icon.appendChild(i);
			icon.style.paddingRight = '8px';
		} else {
			if (item.isDirectory()) {
				icon.innerHTML = "<i class='icon icon-file-directory'>";
			} else {
				icon.innerHTML = "<i class='icon icon-file-text'>";
			}
		}
		li.appendChild(icon);

		const text = document.createElement('span');
		text.classList.add('right');
		text.innerText = item.name;
		li.appendChild(text);

		return li;
	}

	async update(): void {
		this.selectList.reset();
		this.disposables.dispose();
		this.disposables = new CompositeDisposable();
		Log.info('Current Directory:', this.currDirectory);
		const list = fs.readdirSync(this.currDirectory, { withFileTypes: true });
		list.sort((a, b) => {
			if (a.isDirectory() && !b.isDirectory()) {
				return -1;
			} else if (!a.isDirectory() && b.isDirectory()) {
				return 1;
			}
			return (a.name >= b.name);
		});
		const current = new fs.Dirent(this.currDirectory, 2);
		current.name = '.';
		const parent = new fs.Dirent(path.join(this.currDirectory, '..'), 2);
		parent.name = '..';
		const items = [current, parent].concat(list);
		await this.selectList.update({ items: items, infoMessage: this.currDirectory });
	}

	open(name: String, newWindow: Boolean): void {
		this.hide();
		const full = path.join(this.currDirectory, name);
		atom.open({ pathsToOpen: full, newWindow: newWindow });
	}

	query(name: String): void {
		const lastChar = name[name.length - 1];
		if (name === '~') {
			if (process.env.home) {
				this.currDirectory = process.env.home;
				this.update();
			}
		} else if (lastChar === '/' || lastChar === '\\') {
			this.currDirectory = path.join(this.currDirectory, name);
			this.update();
		}
	}

	select(item: fs.Drient): void {
		if (item.isDirectory()) {
			if (item.name === '.') {
				this.open(item.name, true);
			} else {
				this.currDirectory = path.join(this.currDirectory, item.name);
				this.update();
			}
		} else {
			this.open(item.name, false);
		}
	}

	input(): void {
		const name = this.selectList.getQuery();
		this.open(name, false);
	}

	getCurrentDirectory(): String {
		const projects = atom.project.getPaths();
		if (projects.length > 0) {
			return projects[0];
		}
		const editor = atom.workspace.getActiveTextEditor();
		if (editor) {
			const file = editor.getPath();
			return path.dirname(file);
		}
		if (process.env.home) {
			return process.env.home;
		}
		return '';
	}

	async show(): void {
		if (!this.panel) {
			this.panel = atom.workspace.addModalPanel({
				item: this.selectList.element,
				visible: false
			});
		}

		this.currDirectory = this.getCurrentDirectory();
		await this.update();

		this.prevElement = document.activeElement;
		this.panel.show();
		this.selectList.focus();
	}

	async hide(): void {
		if (this.panel) {
			this.panel.hide();
		}
		if (this.prevElement) {
			this.prevElement.focus();
			this.prevElement = null;
		}
	}
}
