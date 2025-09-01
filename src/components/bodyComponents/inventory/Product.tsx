import { Avatar, Typography, Box } from "@mui/material";
import React from "react";
//more about avatar refres to https://mui.com/material-ui/react-avatar/
const Product: React.FC<{ productName: string }> = ({ productName }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        alt="alt"
        // src="image/source"
        sx={{ width: 30, height: 30 }}
      >
        A
      </Avatar>

      <Typography variant="subtitle2" sx={{ flex: 1 }}>
        {productName}
      </Typography>
    </Box>
  );
}

export default Product;
