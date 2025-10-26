import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { toast } from "react-toastify";

export default function ConfirmDeleteModal({ open, onClose, onConfirm, username }) {
  const handleConfirm = async () => {
    const result = await onConfirm(); 

    if (result?.success) {
      toast.success(result.message || "Xoá người dùng thành công!");
    } else {
      toast.error(result?.message || "Không thể xoá người dùng. Vui lòng thử lại!");
    }

    onClose(); 
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, color: "error.main" }}
      >
        <WarningAmberIcon color="error" />
        Xác nhận xoá
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {username ? (
            <>
              Bạn có chắc muốn xoá người dùng{" "}
              <Typography component="span" fontWeight="bold" color="error.main">
                "{username}"
              </Typography>{" "}
              không?
            </>
          ) : (
            "Bạn có chắc muốn xoá người dùng này không?"
          )}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Huỷ
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error">
          Xoá
        </Button>
      </DialogActions>
    </Dialog>
  );
}
