'use strict';

 global.isTMDKMember = function (user) {
 	if (!user) return;
 	if (typeof user === 'Object') user = user.userid;
 	let TMDKMember = Db('tmdkmembership').get(toId(user));
 	if (TMDKMember === 1) return true;
 	return false;
 };
 
 exports.commands = {
 		addTMDKMember: function (target, room, user) {
 			if (!this.can('declare')) return false;
 			let TMDKUser = toId(target);
 			if (!TMDKUser) return this.parse('/TMDK');
 			if (isTMDKMember(TMDKUser)) return this.errorReply(TMDKUser + ' is already a member of TMDK.');
 			Db('tmdkmembership').set(TMDKUser, 1);
			this.sendReply(TMDKUser + ' has been added in the contributor list.');
 	},
 		removecontributor: function (target, room, user) {
 			if (!this.can('declare')) return false;
 			let TMDKUser = toId(target);
 			if (!TMDKUser) return this.parse('/contributor');
 			if (!isCONTRIBUTOR(TMDKUser)) return this.errorReply(TMDKUser + ' is not a contributor.');
 			Db('tmdkmembership').delete(TMDKUser);
 			this.sendReply(TMDKUser + ' has been removed from the contributor list');
 		},
 		contributors: function (target, room, user) {
 			if (!this.can('declare')) return false;
 			if (!Object.keys(Db('tmdkmembership').object()).length) return this.errorReply('There seems to be no user in contributors list.');
  		this.sendReplyBox('<center><b><u>Server Contributors</u></b></center>' + '<br /><br />' + Object.keys(Db('tmdkmembership').object()).join('<br />'));
 	},
 };
