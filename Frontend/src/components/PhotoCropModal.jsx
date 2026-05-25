import { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { API_BASE, apiUpload } from "../api";

function PhotoCropModal({ theme, memberId, onSuccess, onClose }) {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef(null);
  const inputRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "");
      setCrop(undefined);
      setCompletedCrop(undefined);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
      width,
      height,
    );
    setCrop(initial);
  };

  const getCroppedBlob = () => {
    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const SIZE = 400;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const px = (completedCrop.x / 100) * image.width;
    const py = (completedCrop.y / 100) * image.height;
    const pw = (completedCrop.width / 100) * image.width;
    const ph = (completedCrop.height / 100) * image.height;

    ctx.drawImage(
      image,
      px * scaleX,
      py * scaleY,
      pw * scaleX,
      ph * scaleY,
      0,
      0,
      SIZE,
      SIZE,
    );

    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  };

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsUploading(true);
    try {
      const blob = await getCroppedBlob();
      const fd = new FormData();
      fd.append("member_id", memberId);
      fd.append("photo", blob, "profile.jpg");
      const res = await apiUpload("upload_member_photo.php", fd).then((r) =>
        r.json(),
      );
      if (res.success) {
        onSuccess(`${API_BASE}/${res.photo_url}?t=${Date.now()}`);
      } else {
        alert(res.error || "Upload failed.");
      }
    } catch {
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1200,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          padding: "28px",
          borderRadius: "14px",
          width: "480px",
          maxHeight: "92vh",
          overflowY: "auto",
          border: `1px solid ${theme.border}`,
          boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px" }}>📷 Upload Profile Photo</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ❌
          </button>
        </div>

        {!imgSrc ? (
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${theme.border}`,
              borderRadius: "12px",
              padding: "48px 24px",
              textAlign: "center",
              cursor: "pointer",
              color: theme.textMuted,
              transition: "border-color 0.2s",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🖼️</div>
            <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
              Click to choose a photo
            </div>
            <div style={{ fontSize: "12px" }}>JPG, PNG or WebP — max 5 MB</div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <>
            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: "13px",
                color: theme.textMuted,
                textAlign: "center",
              }}
            >
              Drag the circle to adjust. The crop is 1:1 (square → saved as circle).
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                maxHeight: "360px",
                overflow: "hidden",
                borderRadius: "8px",
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={(_, pct) => setCrop(pct)}
                onComplete={(_, pct) => setCompletedCrop(pct)}
                aspect={1}
                circularCrop
                minWidth={40}
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: "360px", maxWidth: "100%", display: "block" }}
                  alt="crop preview"
                />
              </ReactCrop>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                onClick={() => {
                  setImgSrc("");
                  setCrop(undefined);
                  setCompletedCrop(undefined);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "transparent",
                  color: theme.textMuted,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ↩ Choose Different
              </button>
              <button
                onClick={handleUpload}
                disabled={!completedCrop || isUploading}
                style={{
                  flex: 2,
                  padding: "12px",
                  backgroundColor:
                    !completedCrop || isUploading ? theme.border : theme.primary,
                  color:
                    !completedCrop || isUploading
                      ? theme.textMuted
                      : theme.primaryText,
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    !completedCrop || isUploading ? "default" : "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {isUploading ? "Uploading…" : "✅ Upload Photo"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PhotoCropModal;
