import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";

export default function ShippingRateModal({
  open,
  onClose,
  mode = "add",
  selected,
  onSave,
}) {
  const isView = mode === "view";
  const [form, setForm] = useState({
    baseFee: "",
    ratePerKm: "",
    volumetricDivisor: "",
    ratePerKg: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (selected) {
      setForm({
        baseFee: selected.baseFee || "",
        ratePerKm: selected.ratePerKm || "",
        volumetricDivisor: selected.volumetricDivisor || "",
        ratePerKg: selected.ratePerKg || "",
      });
    } else {
      setForm({
        baseFee: "",
        ratePerKm: "",
        volumetricDivisor: "",
        ratePerKg: "",
      });
    }
    setError("");
  }, [selected, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    const { baseFee, ratePerKm, volumetricDivisor, ratePerKg } = form;
    if (!baseFee || !ratePerKm || !volumetricDivisor || !ratePerKg) {
      setError("Vui lòng điền đầy đủ các trường.");
      return false;
    }
    if (
      isNaN(baseFee) ||
      isNaN(ratePerKm) ||
      isNaN(ratePerKg) ||
      isNaN(volumetricDivisor)
    ) {
      setError("Các trường số phải là số hợp lệ.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
  if (!validateForm()) return;

  try {
    const result = await onSave({
      ...form,
      baseFee: parseFloat(form.baseFee),
      ratePerKm: parseFloat(form.ratePerKm),
      volumetricDivisor: parseFloat(form.volumetricDivisor),
      ratePerKg: parseFloat(form.ratePerKg),
    });

    if (result.success) {
      onClose();
    } else if (result.status === 403) {
      toast.error("Bạn không có quyền thực hiện thao tác này.");
    } else {
      setError(result.message || "Lưu thất bại.");
    }
  } catch (err) {
    if (err?.response?.status === 403) {
      toast.error("Bạn không có quyền thực hiện thao tác này.");
    } else {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  }
};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "rounded-2xl shadow-lg",
        style: { backgroundColor: "#FFFFFF" },
      }}
    >
      <DialogTitle className="text-orange-600 font-bold text-xl">
        {isView ? "Chi tiết phí ship" : "Thêm phí ship mới"}
      </DialogTitle>

      <DialogContent className="pt-2 pb-1">
        {error && (
          <Alert severity="error" className="mb-3">
            {error}
          </Alert>
        )}

        <div className="flex flex-col gap-5 mt-3">
          <TextField
            fullWidth
            label="Phí cơ bản (đ)"
            name="baseFee"
            value={form.baseFee}
            onChange={handleChange}
            disabled={isView}
            variant="outlined"
            type="number"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Phí mỗi km (đ)"
            name="ratePerKm"
            value={form.ratePerKm}
            onChange={handleChange}
            disabled={isView}
            variant="outlined"
            type="number"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Hệ số chia thể tích"
            name="volumetricDivisor"
            value={form.volumetricDivisor}
            onChange={handleChange}
            disabled={isView}
            variant="outlined"
            type="number"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Phí mỗi kg (đ)"
            name="ratePerKg"
            value={form.ratePerKg}
            onChange={handleChange}
            disabled={isView}
            variant="outlined"
            type="number"
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </DialogContent>

      <DialogActions className="p-4">
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: "#FF9800", color: "#FF9800" }}
        >
          Đóng
        </Button>
        {!isView && (
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: "#FB8C00",
              "&:hover": { backgroundColor: "#F57C00" },
            }}
          >
            Lưu
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
