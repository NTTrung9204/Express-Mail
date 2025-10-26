import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  warehouse,
}) {
  if (!warehouse) return null;

  const handleConfirm = () => {
    onConfirm(warehouse.id);
    toast.success(`Đã xoá kho "${warehouse.name}" thành công!`);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle className="flex items-center gap-2 text-red-600">
          <WarningAmberIcon color="error" /> Xác nhận xoá kho
        </DialogTitle>

        <DialogContent>
          <p className="text-gray-700">
            Bạn có chắc chắn muốn xoá kho{" "}
            <span className="font-semibold text-red-500">{warehouse.name}</span>?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Huỷ
          </Button>
          <Button
            onClick={handleConfirm}
            color="error"
            variant="contained"
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
