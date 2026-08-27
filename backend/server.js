import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import validationRouter from './routes/validation.js';
import { getPool } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/validations', validationRouter);

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
// Start server and report DB status
app.listen(PORT, async () => {
	console.log(`Server listening on port ${PORT}`);
	try {
		const pool = await getPool();
		if (pool) {
			console.log('Database connected');
		} else {
			console.warn('Database unavailable - routes will return 503 until DB is reachable');
		}
	} catch (err) {
		console.warn('Database check failed:', err?.message || err);
	}
});
