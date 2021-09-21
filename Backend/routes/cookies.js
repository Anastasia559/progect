const COOKIE_NAME = 'ORTPORTAL';
const SESSIONS = {};
const util = require('util');
var now = new Date();
module.exports = {
	CHECK: function (req) {
		return (req && req.cookies && (COOKIE_NAME in req.cookies) && (req.cookies[COOKIE_NAME] in SESSIONS) && SESSIONS[req.cookies[COOKIE_NAME]]);

	},
	CHECK_OPT: function (req, role, login) {
		const RBL = ((req && req.body && req.body.login) ? req.body.login : false);
		switch (role) {
			case 2:
				return ((module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 2)) || (RBL === login));
				break;
			case 3:
				return ((module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 3)) || (RBL === login));
				break;
			case 4:
				return ((module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 4)) || (RBL === login));
				break;
			case 5:
				return ((module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 5)) || (RBL === login));
				break;
			case 6:
				return ((module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 6)) || (RBL === login));
				break;
			case 7:
				return ((module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 7)) || (RBL === login));
				break;
			case 11:
				return (module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 6));
				break;
			case 12:
				return (module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 2));
				break;
			case 15:
				return (module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 5));
				break;
			case 22:
				return (module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 7));
				break;
			case 33:
				return (module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 3));
				break;
			case 44:
				return (module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type === 4));
				break;
			case 100:
				return (module.exports.CHECK(req) && (SESSIONS[req.cookies[COOKIE_NAME]].type > 0));
				break;
		}
	},

	HAS: function (req) {
		return (req && req.cookies && (COOKIE_NAME in req.cookies) && (req.cookies[COOKIE_NAME] in SESSIONS));
	},
	GENERATE: function () {
		const generated = require('uuid/v4')();
		SESSIONS[generated] = { type: 0, username: false, id: 0 };
		return generated;
	},
	DISPOSE: function (req, res) {
		var cookie = req.cookies[COOKIE_NAME];
		res.clearCookie(COOKIE_NAME);
		delete SESSIONS[cookie];
	},
	ISSUE: function (res) {
		const cookie = module.exports.GENERATE();
		res.cookie(COOKIE_NAME, cookie, { maxAge: 6000000, httpOnly: true });
		return cookie;
	},
	LOGIN: function (req, res, role, login, userid, univ_id) {
		switch (role) {
			case 6:
				if (module.exports.CHECK(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]].type = role;
					console.log(util.inspect(SESSIONS, { showHidden: false, depth: null }))
				}
				if (module.exports.HAS(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]] = { type: role, username: login, id: userid, expires: now };
				} else {
					SESSIONS[module.exports.ISSUE(res)] = { type: role, username: login, id: userid, expires: now };
				}
				break;
			case 7:
				if (module.exports.CHECK(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]].type = role;
					console.log(util.inspect(SESSIONS, { showHidden: false, depth: null }))
				}
				if (module.exports.HAS(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]] = { type: role, username: login, id: userid, expires: now };
				} else {
					SESSIONS[module.exports.ISSUE(res)] = { type: role, username: login, id: userid, expires: now };
				}
				break;
			case 3:
				if (module.exports.CHECK(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]].type = role;
					console.log(util.inspect(SESSIONS, { showHidden: false, depth: null }))
				}
				if (module.exports.HAS(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]] = { type: role, username: login, id: userid, expires: now };
				} else {
					SESSIONS[module.exports.ISSUE(res)] = { type: role, username: login, id: userid, expires: now };
				}
				break;
			case 4:
				if (module.exports.CHECK(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]].type = role;
					console.log(util.inspect(SESSIONS, { showHidden: false, depth: null }))
				}
				if (module.exports.HAS(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]] = { type: role, username: login, id: userid, univ_id: univ_id, expires: now };
				} else {
					SESSIONS[module.exports.ISSUE(res)] = { type: role, username: login, id: userid, univ_id: univ_id, expires: now };
				}
				break;

			case 2:
				if (module.exports.CHECK(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]].type = role;
					console.log(util.inspect(SESSIONS, { showHidden: false, depth: null }))
				}
				if (module.exports.HAS(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]] = { type: role, username: login, id: userid, expires: now };
				} else {
					SESSIONS[module.exports.ISSUE(res)] = { type: role, username: login, id: userid, expires: now };
				}
				break;
			case 5:
				if (module.exports.CHECK(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]].type = role;
					console.log(util.inspect(SESSIONS, { showHidden: false, depth: null }))
				}
				if (module.exports.HAS(req)) {
					SESSIONS[req.cookies[COOKIE_NAME]] = { type: role, username: login, id: userid, expires: now };
				} else {
					SESSIONS[module.exports.ISSUE(res)] = { type: role, username: login, id: userid, expires: now };
				}
				break;
		}
	}
};
module.exports['SESSIONS'] = SESSIONS;
module.exports['COOKIE_NAME'] = COOKIE_NAME;
