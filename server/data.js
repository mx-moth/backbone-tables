var Collection = require('../lib/collection').Collection;
var User = require('./models/user').User;
var Group = require('./models/group').Group;

module.exports.create = function() {
	var models = {};

	models.users = new Collection("Users");
	models.users.push(
		new User({
			id: 'tim',
			name: 'Tim Heap',
			email: 'tim@example.com',
			groups: ['admin', 'users'],
		}),
		new User({
			id: 'emma',
			name: 'Emma Gardner',
			email: 'emma@example.com',
			groups: ['users'],
		}),

		new User({id:"aaron", name:"Aaron Erick Lozada", email:"aaron@example.com", groups:['users']}),
		new User({id:"aarón", name:"Aarón Ñíguez", email:"aarón@example.com", groups:['users']}),
		new User({id:"al", name:"Al Aarons", email:"al@example.com", groups:['users']}),
		new User({id:"andreas", name:"Andreas Aarflot", email:"andreas@example.com", groups:['users']}),
		new User({id:"andris", name:"Andris Ārgalis", email:"andris@example.com", groups:['users']}),
		new User({id:"ann", name:"Ann Kristin Aarønes", email:"ann@example.com", groups:['users']}),
		new User({id:"asa", name:"Asa Aarons", email:"asa@example.com", groups:['users']}),
		new User({id:"ben", name:"Ben Aaronovitch", email:"ben@example.com", groups:['users']}),
		new User({id:"blake", name:"Blake Aaron", email:"blake@example.com", groups:['users']}),
		new User({id:"carlton", name:"Carlton Aaron", email:"carlton@example.com", groups:['users']}),
		new User({id:"caroline", name:"Caroline Aaron", email:"caroline@example.com", groups:['users']}),
		new User({id:"chester", name:"Chester Aaron", email:"chester@example.com", groups:['users']}),
		new User({id:"cynthia", name:"Cynthia Aaron", email:"cynthia@example.com", groups:['users']}),
		new User({id:"daniel", name:"Daniel Aaron", email:"daniel@example.com", groups:['users']}),
		new User({id:"david", name:"David L. Aaron", email:"david@example.com", groups:['users']}),
		new User({id:"eero", name:"Eero Aarnio", email:"eero@example.com", groups:['users']}),
		new User({id:"eivind", name:"Eivind Aarset", email:"eivind@example.com", groups:['users']}),
		new User({id:"eric", name:"Eric Aarons", email:"eric@example.com", groups:['users']}),
		new User({id:"eva", name:"Eva Aariak", email:"eva@example.com", groups:['users']}),
		new User({id:"george", name:"George Aaron", email:"george@example.com", groups:['users']}),
		new User({id:"hank", name:"Hank Aaron", email:"hank@example.com", groups:['users']}),
		new User({id:"j.", name:"J. M. Aaron Rashid", email:"j.@example.com", groups:['users']}),
		new User({id:"jamale", name:"Jamale Aarrass", email:"jamale@example.com", groups:['users']}),
		new User({id:"jason", name:"Jason Aaron", email:"jason@example.com", groups:['users']}),
		new User({id:"joe", name:"Joe Aaron", email:"joe@example.com", groups:['users']}),
		new User({id:"john", name:"John Aaron", email:"john@example.com", groups:['users']}),
		new User({id:"john-Ragnar", name:"John-Ragnar Aarset", email:"john-Ragnar@example.com", groups:['users']}),
		new User({id:"jonathan", name:"Jonathan Aaron", email:"jonathan@example.com", groups:['users']}),
		new User({id:"kenny", name:"Kenny Aaronson", email:"kenny@example.com", groups:['users']}),
		new User({id:"kiur", name:"Kiur Aarma", email:"kiur@example.com", groups:['users']}),
		new User({id:"knut", name:"Knut O. Aarethun", email:"knut@example.com", groups:['users']}),
		new User({id:"lee", name:"Lee Aaron", email:"lee@example.com", groups:['users']}),
		new User({id:"manuel", name:"Manuel Aaron", email:"manuel@example.com", groups:['users']}),
		new User({id:"mark", name:"Mark Aarons", email:"mark@example.com", groups:['users']}),
		new User({id:"max", name:"Max Aaron", email:"max@example.com", groups:['users']}),
		new User({id:"michael", name:"Michael Aarons", email:"michael@example.com", groups:['users']}),
		new User({id:"mika", name:"Mika Ääritalo", email:"mika@example.com", groups:['users']}),
		new User({id:"mikko", name:"Mikko Aarni", email:"mikko@example.com", groups:['users']}),
		new User({id:"owen", name:"Owen Aaronovitch", email:"owen@example.com", groups:['users']}),
		new User({id:"quinton", name:"Quinton Aaron", email:"quinton@example.com", groups:['users']}),
		new User({id:"reino", name:"Reino Aarnio", email:"reino@example.com", groups:['users']}),
		new User({id:"scott", name:"Scott Aaronson", email:"scott@example.com", groups:['users']}),
		new User({id:"unn", name:"Unn Aarrestad", email:"unn@example.com", groups:['users']})
	);
	models.groups = new Collection("Groups");
	models.groups.push(
		new Group({
			id: 'admin',
			name: 'Administrators',
			users: ['tim'],
		}),
		new Group({
			id: 'users',
			name: 'Users',
			users: ['tim', 'emma'],
		})
	);

	return models;
};
