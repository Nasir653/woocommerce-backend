import app from './app.js';
import { sequelize } from './config/db.js';

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
})();

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});
