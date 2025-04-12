import { configureStore } from "@reduxjs/toolkit";
import ovelayElementsSlice from "./overlayElementsSlice";

const store = configureStore({
  reducer: {
    overlayElements: ovelayElementsSlice,
  },
});

export default store;
