import { configureStore } from "@reduxjs/toolkit";

import middleware from "@/middleware";
import reducer from "@/slice";

export default configureStore({
  reducer: reducer,
  middleware: middleware,
  devTools: true,
});
