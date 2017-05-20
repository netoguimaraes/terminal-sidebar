# terminal-sidebar

> based on tiny-care-terminal, by notwaldorf

A simple terminal sidebar. Ideal for using with any multiplexer client, like tmux, tilix and others. It contains some twitter bots, an animal companion, some weather stuff and updates at every minute.

## Make it go

### 1. Clone it

```
$ git clone https://github.com/netoguimaraes/terminal-sidebar.git
```

### 2. Start!

at project root dir:
```
$ node sidebar.js
You can exit the dashboard by pressing esc or q. You can refresh it manually by pressing r.
```
## 3. Customization

For customizations on layout, see blessed-contrib grids;

Other configs can be overwrited in config.js;
```javascript
twitter: an array with twitter usernames (dafault are bots). This will fill the twitter boxes.
weather: a city name to show up weather;
celsius: if true, degree are showed as celsius. if not it's Fahrenheits.
```
## :tomato: Pomodoro Mode

You can press 'p' to switch parrot box to pomodoro mode.

Other commands while in pomodoro mode:

 s - start/pause/resume pomodoro
 e - stop pomodoro
 u - update pomodoro duration
 b - update break time

Take care of yourself, ok? :sparkling_heart:
