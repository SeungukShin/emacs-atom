'use babel';

import { CompositeDisposable } from 'atom';
import FindFileView from './find-file-view';

const unsetKeys = [
	'ctrl-x',
	'ctrl-c',
	'ctrl-k'
];

const keybindings = [
	// Changing the location of point
	{
		"body": {
			"ctrl-p": "emacs-atom:move-up",
			"ctrl-n": "emacs-atom:move-down",
			"ctrl-b": "emacs-atom:move-left",
			"ctrl-f": "emacs-atom:move-right",
			"alt-v": "emacs-atom:page-up",
			"ctrl-v": "emacs-atom:page-down",
			"alt-<": "emacs-atom:move-to-top",
			"alt->": "emacs-atom:move-to-bottom"
		},
		"atom-text-editor": {
			"alt-b": "emacs-atom:move-to-previous-subword-boundary",
			"alt-f": "emacs-atom:move-to-next-subword-boundary",
			"ctrl-a": "emacs-atom:move-to-first-character-of-line",
			"ctrl-e": "emacs-atom:move-to-end-of-line",
			"alt-g g": "go-to-line:toggle",
			"ctrl-space": "emacs-atom:toggle-mode-line",
			"ctrl-enter": "emacs-atom:toggle-mode-column",
			"escape": "emacs-atom:clear-mode"
		}
	},

	// Searching
	{
		"atom-text-editor": {
			"ctrl-s": "find-and-replace:show",
			"ctrl-r": "find-and-replace:show"
		},
		"atom-panel": {
			"ctrl-s": "find-and-replace:find-next",
			"ctrl-r": "find-and-replace:find-previous"
		}
	},

	// Killing and yanking text
	{
		"atom-text-editor": {
			"ctrl-d": "core:delete",
			"ctrl-w": "core:cut",
			"ctrl-k": "editor:cut-to-end-of-line",
			"alt-w": "core:copy",
			"ctrl-y": "core:paste"
		}
	},

	// Files
	{
		"atom-workspace": {
			"ctrl-x ctrl-f": "emacs-atom:find-file",
			"ctrl-x ctrl-s": "core:save"
		}
	},

	// Running commands by name
	{
		"atom-workspace": {
			"alt-x": "command-palette:toggle"
		}
	},

	// Killing buffers
	{
		"atom-workspace": {
			"ctrl-x k": "core:close"
		}
	},

	// Exiting
	{
		"atom-workspace": {
			"ctrl-x ctrl-c": "core:quit"
		}
	},

	// Undoing
	{
		"atom-text-editor": {
			"ctrl-/": "core:undo"
		}
	},

	// Comment commands
	{
		"atom-text-editor": {
			"ctrl-x ctrl-;": "editor:toggle-line-comments"
		}
	},

	// Creating and selecting buffers
	{
		"atom-workspace": {
			"ctrl-x b": "pane:show-next-recently-used-item"
		}
	}
];

const EmacsMode = Object.freeze({
	'none': 'none',
	'line': 'line',
	'column': 'column'
});

class EmacsAtom {
	subscriptions: CompositeDisposable;
	findFileView: FindFileView;
	emacsMode;
	statusBar;
	statusBarTile;
	statusBarTimer: NodeJS.Timer;

	activate() {
		this.subscriptions = new CompositeDisposable();
		this.findFileView = new FindFileView();
		this.emacsMode = EmacsMode.none;

		// Register commands
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'emacs-atom:toggle-mode-line': () => this.toggleMode(EmacsMode.line),
			'emacs-atom:toggle-mode-column': () => this.toggleMode(EmacsMode.column),
			'emacs-atom:clear-mode': () => this.toggleMode(EmacsMode.none),
			'emacs-atom:move-up': () => this.moveUp(),
			'emacs-atom:move-down': () => this.moveDown(),
			'emacs-atom:move-left': () => this.moveLeft(),
			'emacs-atom:move-right': () => this.moveRight(),
			"emacs-atom:page-up": () => this.pageUp(),
			"emacs-atom:page-down": () => this.pageDown(),
			"emacs-atom:move-to-top": () => this.MoveToTop(),
			"emacs-atom:move-to-bottom": () => this.moveToBottom(),
			"emacs-atom:move-to-previous-subword-boundary": () => this.moveToPrevWord(),
			"emacs-atom:move-to-next-subword-boundary": () => this.moveToNextWord(),
			"emacs-atom:move-to-first-character-of-line": () => this.moveToBeginningOfLine(),
			"emacs-atom:move-to-end-of-line": () => this.moveToEndOfLine(),
			'emacs-atom:find-file': () => this.findFileView.show()
		}));

		// Unbind keys
		const bindings = atom.keymaps.getKeyBindings();
		for (const item of bindings) {
			for (const key of unsetKeys) {
				if (item.keystrokes.startsWith(key)) {
					const keymap = {};
					keymap[item.keystrokes] = 'unset!';
					const keybinding = {};
					keybinding[item.selector] = keymap;
					atom.keymaps.add(item.source, keybinding);
					break;
				}
			}
		}

		// Bind keys
		for (const keybinding of keybindings) {
			atom.keymaps.add('emacs-atom', keybinding, 1);
		}

		console.log('"emacs-atom" is now active!');
	}

	deactivate() {
		this.findFileView.destroy();
		this.subscriptions.dispose();
		if (this.statusBarTimer) {
			clearTimeout(this.statusBarTimer);
			this.statusBarTimer = null;
		}
		if (this.statusBarTile) {
			this.statusBarTile.destroy();
			this.statusBarTile = null;
		}
		this.statusBar = null;

		console.log('"emacs-atom" is now inactive!');
	}

	toggleMode(mode) {
		const editor = atom.workspace.getActiveTextEditor();
		if (editor) {
			const view = atom.views.getView(editor);
			if (view) {
				atom.commands.dispatch(view, 'editor:consolidate-selections');
			}
			for (const selection of editor.getSelections()) {
				selection.clear();
			}
		}
		if (this.emacsMode === mode) {
			this.emacsMode = EmacsMode.none;
		} else {
			this.emacsMode = mode;
		}

		if (this.statusBar) {
			if (this.statusBarTimer) {
				clearTimeout(this.statusBarTimer);
			}
			if (this.statusBarTile) {
				this.statusBarTile.destroy();
			}
			const span = document.createElement('span');
			span.innerText = 'emacs mode: ' + this.emacsMode;
			this.statusBarTile = this.statusBar.addLeftTile({ item: span });
			this.statusBarTimer = setTimeout((self) => {
				if (self.statusBarTile) {
					self.statusBarTile.destroy();
					self.statusBarTile = null;
				}
			}, 500, this);
		}
	}

	moveUp() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'core:move-up');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				const cmd = (this.emacsMode === EmacsMode.line) ?
					'core:select-up' : 'editor:add-selection-above';
				atom.commands.dispatch(view, cmd);
			}
		}
	}

	moveDown() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'core:move-down');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				const cmd = (this.emacsMode === EmacsMode.line) ?
					'core:select-down' : 'editor:add-selection-below';
				atom.commands.dispatch(view, cmd);
			}
		}
	}

	moveLeft() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'core:move-left');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'core:select-left');
			}
		}
	}

	moveRight() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'core:move-right');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'core:select-right');
			}
		}
	}

	pageUp() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'core:page-up');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'core:select-page-up');
			}
		}
	}

	pageDown() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'core:page-down');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'core:select-page-down');
			}
		}
	}

	MoveToTop() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'core:move-to-top');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'core:select-to-top');
			}
		}
	}

	moveToBottom() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'core:move-to-bottom');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'core:select-to-bottom');
			}
		}
	}

	moveToPrevWord() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'editor:move-to-previous-subword-boundary');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'editor:select-to-previous-subword-boundary');
			}
		}
	}

	moveToNextWord() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'editor:move-to-next-subword-boundary');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'editor:select-to-next-subword-boundary');
			}
		}
	}

	moveToBeginningOfLine() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'editor:move-to-first-character-of-line');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'editor:select-to-first-character-of-line');
			}
		}
	}

	moveToEndOfLine() {
		if (this.emacsMode === EmacsMode.none) {
			const view = atom.views.getView(atom.workspace.getActivePaneItem());
			if (view) {
				atom.commands.dispatch(view, 'editor:move-to-end-of-line');
			}
		} else {
			const view = atom.views.getView(atom.workspace.getActiveTextEditor());
			if (view) {
				atom.commands.dispatch(view, 'editor:select-to-end-of-line');
			}
		}
	}

	consumeStatusBar(statusBar) {
		this.statusBar = statusBar;
	}

	consumeElementIcons(func) {
		this.findFileView.addIconToElement = func;
	}
}

const emacsAtom = new EmacsAtom();
export default emacsAtom;
