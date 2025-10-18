import axios from 'axios';

const API_BASE_URL = 'http://your-api-url.com/api'; // Replace with your actual API URL

export const fetchRecentTopics = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/topics/recent`);
        return response.data;
    } catch (error) {
        console.error('Error fetching recent topics:', error);
        throw error;
    }
};

export const fetchOnlineUsers = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/online`);
        return response.data;
    } catch (error) {
        console.error('Error fetching online users:', error);
        throw error;
    }
};

export const fetchTopPlayers = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/players/top`);
        return response.data;
    } catch (error) {
        console.error('Error fetching top players:', error);
        throw error;
    }
};

// Add more API functions as needed for your application.