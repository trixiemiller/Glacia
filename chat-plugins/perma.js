'use strict';
let fs = require("fs");
let permaUsers;
try {
	permaUsers = JSON.parse(fs.readFileSync("config/perma.json"));
} catch (e) {
	permaUsers = {};
	console.log("Unable to load config/perma.txt; creating empty object.");
}
Users.parsePerma = function (userid, targetUser) {
	if (!userid) return;
	if (userid in permaUsers) {
		try {
			if (!Users(userid)) return false;
			Users(userid).deconfirm(); // prevent any issues with failing to lock
			Punishments[permaUsers[userid] || "lock"](Users(userid), null, null); // safety catch
			// Monitor.log("[PermaMonitor] Applied " + permaUsers[userid] + " to user: " + userid);
		} catch (e) {
			Monitor.log("[PermaMonitor] Unable to apply " + permaUsers[userid] + " to user: " + userid);
		}
	}
};

exports.commands = {
plock: 'permalock',
	permalock: function (target, room, user, connection) {
		if (!this.can('declare')) return false;
		if (!target) return this.parse('/help permalock');
		let userid = toId(target);
		let targetUser = Users(target);
		if (userid in permaUsers) return this.errorReply("User " + userid + " is already perma" + permaUsers[userid] + (permaUsers[userid] === "ban" ? "ned" : "ed") + ".");
		if (targetUser && targetUser.confirmed) {
			let from = targetUser.deconfirm();
			Monitor.log("[CrisisMonitor] " + targetUser.name + " was permalocked by " + user.name + " and demoted from " + from.join(", ") + ".");
		}
		permaUsers[userid] = "lock";
		try {
			Punishments.lock(Users(userid), null, null);
		} catch (e) {}
		this.addModCommand(userid + " was permalocked by " + user.name + ".");
		fs.writeFileSync("config/perma.json", JSON.stringify(permaUsers));
	},

	unplock: 'unpermalock',
	unpermalock: function (target, room, user, connection) {
		if (!this.can('declare')) return false;
		if (!target) return this.parse('/help unpermalock');
		let userid = toId(target);
		if (!(userid in permaUsers) || permaUsers[userid] !== "lock") return this.errorReply(userid + " is not permalocked!");
		try {
			Punishments.unlock(userid);
		} catch (e) {}
		delete permaUsers[userid];
		this.addModCommand(userid + " was unpermalocked by " + user.name + ".");
		fs.writeFileSync("config/perma.json", JSON.stringify(permaUsers));
	},

	pban: 'permaban',
	permaban: function (target, room, user, connection) {
		if (!this.can('declare')) return false;
		if (!target) return this.parse('/help permaban');
		let userid = toId(target);
		let targetUser = Users(target);
		if (userid in permaUsers && permaUsers[userid] === "ban") return this.errorReply("User " + userid + " is already permabanned.");
		if (targetUser && targetUser.confirmed) {
			let from = targetUser.deconfirm();
			Monitor.log("[CrisisMonitor] " + targetUser.name + " was perma banned by " + user.name + " and demoted from " + from.join(", ") + ".");
		}
		permaUsers[userid] = "ban";
		try {
			Punishments.ban(Users(userid), null, null);
		} catch (e) {}
		this.addModCommand(userid + " was permabanned by " + user.name + ".");
		fs.writeFileSync("config/perma.json", JSON.stringify(permaUsers));
	},

	unpban: 'unpermaban',
	unpermaban: function (target, room, user, connection) {
		if (!this.can('declare')) return false;
		if (!target) return this.parse('/help unpermaban');
		let userid = toId(target);
		if (!(userid in permaUsers) || permaUsers[userid] !== "ban") return this.errorReply(userid + " is not permabanned!");
		try {
			Punishments.unban(userid);
		} catch (e) {}
		delete permaUsers[userid];
		this.addModCommand(userid + " was unpermabanned by " + user.name + ".");
		fs.writeFileSync("config/perma.json", JSON.stringify(permaUsers));
	},

	plist: 'permalist',
	permalist: function (target, room, user, connection) {
		if (!this.can('declare')) return false;
		let buffer = ["<b>Perma'd users:</b>", ""];
		Object.keys(permaUsers).sort().forEach(function (u) {
			buffer.push("<b>" + u + "</b> - " + permaUsers[u]);
		});
		if (buffer.length === 2) buffer.push("There are currently no perma'd users!");
		this.sendReplyBox(buffer.join("<br>"));
	},
	permalockhelp: ["/permalock [user] - permanantly locks the user."],
	permabanhelp: ["/permaban [user] - permanently bans the user."],
	unpermabanhelp: ["/unpermaban [user] - lifts a permaban."],
	unpermalockhelp: ["/unpermalock [user] - lifts a permalock."],
};
