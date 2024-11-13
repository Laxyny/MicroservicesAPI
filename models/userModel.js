const { ObjectId } = require('mongodb');

function generateSalt(length = 16) {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let salt = '';
	for (let i = 0; i < length; i++) {
		salt += charset[Math.floor(Math.random() * charset.length)];
	}
	return salt;
}

function hashPassword(password, salt) {
    const saltedPassword = password + salt;
    let hash1 = 0;
    let hash2 = 0;

    for (let i = 0; i < saltedPassword.length; i++) {
        const charCode = saltedPassword.charCodeAt(i);
        hash1 = (hash1 << 5) - hash1 + charCode;
        hash1 &= 0xffffffff; // Limite à 32 bits
    }

    for (let i = saltedPassword.length - 1; i >= 0; i--) {
        const charCode = saltedPassword.charCodeAt(i);
        hash2 = (hash2 << 5) + hash2 + charCode;
        hash2 &= 0xffffffff; // Limite à 32 bits
    }

    let combinedHash = Math.abs(hash1 ^ hash2).toString(16); // XOR - hash1 & hash2

    while (combinedHash.length < 64) {
        combinedHash += Math.abs(((combinedHash.length * hash1) ^ (combinedHash.length + hash2)) & 0xffffffff).toString(16);
    }

    combinedHash = combinedHash.slice(0, 64); // 64 carac

    return { hash: combinedHash, salt };
}

function verifyPassword(inputPassword, storedHash, salt) {
	const { hash } = hashPassword(inputPassword, salt);
	return hash === storedHash;
}

class UserModel {
	constructor(collection) {
		this.collection = collection;
	}

	async getAll() {
		return await this.collection.find({}).toArray();
	}

	async getById(id) {
		return await this.collection.findOne({ _id: new ObjectId(id) });
	}

	async create(newUser) {
		const salt = generateSalt();
		const hashedPassword = hashPassword(newUser.password, salt);

		const userToInsert = {
			...newUser,
			passwordHash: hashedPassword,
			//salt: salt
		};
		delete userToInsert.password;

		const result = await this.collection.insertOne(userToInsert);
		return { _id: result.insertedId, ...userToInsert };
	}

	async updateById(id, updatedFields) {
		const result = await this.collection.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: updatedFields }
		);
		return result.matchedCount > 0;
	}

	async deleteById(id) {
		const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
		return result.deletedCount > 0;
	}
}

module.exports = { UserModel, hashPassword, verifyPassword, generateSalt };
