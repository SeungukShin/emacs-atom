# Emacs Package for Atom

[Emacs](https://www.gnu.org/software/emacs/) key bindings into Atom.

![A screenshot of emacs-atom package](https://github.com/SeungukShin/emacs-atom/raw/master/screenshot.png)

## Keybindings
### Changing the Location of Point
| Key       | Description                                                          | Command                                        |
|-----------|----------------------------------------------------------------------|------------------------------------------------|
| `ctrl-p`  | Move up one line                                                     | `emacs-atom:move-up`                           |
| `ctrl-n`  | Move down one line                                                   | `emacs-atom:move-down`                         |
| `ctrl-b`  | Move backward one character                                          | `emacs-atom:move-left`                         |
| `ctrl-f`  | Move forward one character                                           | `emacs-atom:move-right`                        |
| `alt-b`   | Move backward one word                                               | `emacs-atom:move-to-previous-subword-boundary` |
| `alt-f`   | Move forward one word                                                | `emacs-atom:move-to-next-subword-boundary`     |
| `ctrl-a`  | Move to the beinning of the line                                     | `emacs-atom:move-to-first-character-of-line`   |
| `ctrl-e`  | Move to the end of the line                                          | `emacs-atom:move-to-end-of-line`               |
| `alt-v`   | Move one screen backward                                             | `emacs-atom:page-up`                           |
| `ctrl-v`  | Move one screen forward                                              | `emacs-atom:page-down`                         |
| `alt-<`   | Move to the top of the buffer                                        | `emacs-atom:move-to-top`                       |
| `alt->`   | Move to the end of the buffer                                        | `emacs-atom:move-to-bottom`                    |
| `alt-g g` | Read a number *n* and move point to the beginning of line number *n* | `go-to-line:toggle`                            |

### Killing and Yanking Text
| Key      | Description                        | Command                     |
|----------|------------------------------------|-----------------------------|
| `ctrl-d` | Delete the character after point   | `core:delete`               |
| `ctrl-k` | Kill to the end of the line        | `editor:cut-to-end-of-line` |
| `ctrl-w` | Kill the region                    | `emacs-atom:cut`            |
| `alt-w`  | Copy the region into the kill ring | `emacs-atom:copy`           |
| `ctrl-y` | Yank pop                           | `core:paste`                |

### Files
| Key             | Description | Command                |
|-----------------|-------------|------------------------|
| `ctrl-x ctrl-f` | Find file   | `emacs-atom:find-file` |
| `ctrl-x ctrl-s` | Save buffer | `core:save`            |

### Setting the Mark
| Key          | Description                            | Command                       |
|--------------|----------------------------------------|-------------------------------|
| `ctrl-space` | Set the mark at point, and activate it | `emacs-atom:toggle-mode-line` |

### Rectangles
| Key          | Description                | Command                         |
|--------------|----------------------------|---------------------------------|
| `ctrl-enter` | Toggle Rectangle Mark mode | `emacs-atom:toggle-mode-column` |

### Clearing Mode
| Key      | Description                 | Command       |
|----------|-----------------------------|---------------|
| `escape` | Clear mark or retangle mode | `core:cancel` |

### Searching
| Key      | Description         | Command                      |
|----------|---------------------|------------------------------|
| `ctrl-s` | Find next match     | `emacs-atom:search-forward`  |
| `ctrl-r` | Find previous match | `emacs-atom:search-backward` |

### Creating and Selecting Buffers
| Key        | Description     | Command                             |
|------------|-----------------|-------------------------------------|
| `ctrl-x b` | Select a buffer | `pane:show-next-recently-used-item` |

### Killing Buffers
| Key        | Description | Command      |
|------------|-------------|--------------|
| `ctrl-x k` | Kill buffer | `core:close` |

### Comment Commands
| Key        | Description                           | Command                       |
|------------|---------------------------------------|-------------------------------|
| `ctrl-x ;` | Comment or uncomment the current line | `editor:toggle-line-comments` |

### Running Commands by Name
| Key     | Description   | Command                  |
|---------|---------------|--------------------------|
| `alt-x` | Run a command | `command-palette:toggle` |

### Exiting
| Key             | Description | Command     |
|-----------------|-------------|-------------|
| `ctrl-x ctrl-c` | Kill Code   | `core:quit` |
