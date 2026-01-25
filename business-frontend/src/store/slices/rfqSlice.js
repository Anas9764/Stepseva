import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

// Get initial state from localStorage
const getInitialState = () => {
    try {
        const savedRfq = localStorage.getItem('rfqItems');
        return {
            items: savedRfq ? JSON.parse(savedRfq) : [],
            isOpen: false, // For controlling the floating summary/drawer
        };
    } catch (error) {
        console.error('Error loading RFQ items from localStorage:', error);
        return { items: [], isOpen: false };
    }
};

const rfqSlice = createSlice({
    name: 'rfq',
    initialState: getInitialState(),
    reducers: {
        addToRfq: (state, action) => {
            const product = action.payload;
            const existingItem = state.items.find(item => item._id === product._id);

            if (existingItem) {
                toast.error('Product already in RFQ list');
            } else {
                state.items.push({
                    _id: product._id,
                    name: product.name,
                    image: product.image || (product.images && product.images[0]),
                    moq: product.moq || 1,
                    quantity: product.moq || 1, // Default to MOQ
                });
                localStorage.setItem('rfqItems', JSON.stringify(state.items));
                toast.success('Added to RFQ list');
            }
        },
        removeFromRfq: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(item => item._id !== productId);
            localStorage.setItem('rfqItems', JSON.stringify(state.items));
            toast.success('Removed from RFQ list');
        },
        updateRfqQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item._id === id);
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('rfqItems', JSON.stringify(state.items));
            }
        },
        clearRfq: (state) => {
            state.items = [];
            localStorage.removeItem('rfqItems');
        },
        toggleRfqDrawer: (state) => {
            state.isOpen = !state.isOpen;
        },
        setRfqDrawerOpen: (state, action) => {
            state.isOpen = action.payload;
        }
    },
});

export const {
    addToRfq,
    removeFromRfq,
    updateRfqQuantity,
    clearRfq,
    toggleRfqDrawer,
    setRfqDrawerOpen
} = rfqSlice.actions;

export default rfqSlice.reducer;
