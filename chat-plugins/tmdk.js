'use strict';

global.isTMDK = function (user) {
	if (!user) return;
	if (typeof user === 'Object') user = user.userid;
	let TMDK = Db('TMDK').get(toId(user));
	if (TMDK === 1) return true;
	return false;
};

exports.commands = {
		givetmdk: function (target, room, user) {
			if (!this.can('declare')) return false;
			let tmdkUser = toId(target);
			if (!tmdkUser) return this.parse('/help tmdk');
			if (istmdk(tmdkUser)) return this.errorReply(tmdkUser + ' is already a member of TMDK.');
			Db('tmdk').set(tmdkUser, 1);
			this.sendReply(tmdkUser + ' is now a member of TMDK.');
		},
		taketmdk: function (target, room, user) {
			if (!this.can('declare')) return false;
			let tmdkUser = toId(target);
			if (!tmdkUser) return this.parse('/help tmdk');
			if (!istmdk(tmdkUser)) return this.errorReply(tmdkUser + ' is not a member of TMDK.');
			Db('tmdk').delete(tmdkUser);
			this.sendReply(tmdkUser + '\'s TMDK membership has been withdrawn.');
		},
		tmdklist: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!Object.keys(Db('tmdk').object()).length) return this.errorReply('There seems to be no members of TMDK.');
			this.sendReplyBox('<center><b><u>TMDK Members</u></b></center>' + '<br /><br />' + Object.keys(Db('tmdk').object()).join('<br />'));
	},
};
