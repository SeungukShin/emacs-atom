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
			"ctrl-enter": "emacs-atom:toggle-mode-column"
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

const EmacsMove = Object.freeze({
	'move-up': { 'none': 'core:move-up', 'line': 'core:select-up', 'column': 'editor:add-selection-above'},
	'move-down': {'none': 'core:move-down', 'line': 'core:select-down', 'column': 'editor:add-selection-below'},
	'move-left': {'none': 'core:move-left', 'line': 'core:select-left', 'column': 'core:select-left'},
	'move-right': {'none': 'core:move-right', 'line': 'core:select-right', 'column': 'core:select-right'},
	'page-up': {'none': 'core:page-up', 'line': 'core:select-page-up', 'column': 'core:select-page-up'},
	'page-down': {'none': 'core:page-down', 'line': 'core:select-page-down', 'column': 'core:select-page-down'},
	'move-to-top': {'none': 'core:move-to-top', 'line': 'core:select-to-top', 'column': 'core:select-to-top'},
	'move-to-bottom': {'none': 'core:move-to-bottom', 'line': 'core:select-to-bottom', 'column': 'core:select-to-bottom'},
	'move-to-previous-subword-boundary': {'none': 'editor:move-to-previous-subword-boundary', 'line': 'editor:select-to-previous-subword-boundary', 'column': 'editor:select-to-previous-subword-boundary'},
	'move-to-next-subword-boundary': {'none': 'editor:move-to-next-subword-boundary', 'line': 'editor:select-to-next-subword-boundary', 'column': 'editor:select-to-next-subword-boundary'},
	'move-to-first-character-of-line': {'none': 'editor:move-to-first-character-of-line', 'line': 'editor:select-to-first-character-of-line', 'column': 'editor:select-to-first-character-of-line'},
	'move-to-end-of-line': {'none': 'editor:move-to-end-of-line', 'line': 'editor:select-to-end-of-line', 'column': 'editor:select-to-end-of-line'}
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
			'core:cancel': (event) => {
				this.toggleMode(EmacsMode.none);
				event.stopPropagation();
			},
			'emacs-atom:move-up': () => this.move('move-up'),
			'emacs-atom:move-down': () => this.move('move-down'),
			'emacs-atom:move-left': () => this.move('move-left'),
			'emacs-atom:move-right': () => this.move('move-right'),
			"emacs-atom:page-up": () => this.move('page-up'),
			"emacs-atom:page-down": () => this.move('page-down'),
			"emacs-atom:move-to-top": () => this.move('move-to-top'),
			"emacs-atom:move-to-bottom": () => this.move('move-to-bottom'),
			"emacs-atom:move-to-previous-subword-boundary": () => this.move('move-to-previous-subword-boundary'),
			"emacs-atom:move-to-next-subword-boundary": () => this.move('move-to-next-subword-boundary'),
			"emacs-atom:move-to-first-character-of-line": () => this.move('move-to-first-character-of-line'),
			"emacs-atom:move-to-end-of-line": () => this.move('move-to-end-of-line'),
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

	move(cmd) {
		const command = EmacsMove[cmd][this.emacsMode];
		const view = atom.views.getView(atom.workspace.getActivePaneItem());
		if (view) {
			atom.commands.dispatch(view, command);
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
