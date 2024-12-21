import express from 'express';

import {
    registerUser,
    getAllUsers,
    getUserByUsername,
    getUserById,
    getUserByEmail,
    deleteUser,
    updateUserInfo,
    search,
    handleForgetPassword
} from '../../controllers/users.js';
import authenticateUser from '../../middleware/authenticate.js'

//! create a router
const router = express.Router();

router.put('/:username', registerUser);
router.get('/', authenticateUser, getAllUsers);
router.get('/username/:username', getUserByUsername);
router.get('/id/:id', authenticateUser, getUserById);
router.get('/email/:email', authenticateUser, getUserByEmail);
router.delete('/:id', authenticateUser, deleteUser);
router.post('/:id', authenticateUser, updateUserInfo);
router.post('/', authenticateUser, search);
router.patch('/new-password', handleForgetPassword);

export default router;