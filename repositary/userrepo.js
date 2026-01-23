import User from '../model/usermodel.js';

class UserRepository {
    async create(userData) {
        try {
            const user = new User(userData);
            return await user.save();
        } catch (error) {
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            return await User.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async find(filter = {}, options = {}) {
        try {
            const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
            const skip = (page - 1) * limit;

            return await User.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit);
        } catch (error) {
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            return await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            return await User.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }

    async count(filter = {}) {
        try {
            return await User.countDocuments(filter);
        } catch (error) {
            throw error;
        }
    }
}

export default UserRepository;