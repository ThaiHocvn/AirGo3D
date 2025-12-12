import { CloseOutlined } from "@ant-design/icons";
import { Html } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Modal, Spin } from "antd";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BackSide,
  Cache,
  EquirectangularReflectionMapping,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  SRGBColorSpace,
  TextureLoader,
} from "three";

type Props = {
  open: boolean;
  src: { url: string; name: string };
  onClose: () => void;
  fallbackSrc?: string;
};

function FixCanvasOnOpen({ open }: { open: boolean }) {
  const { gl } = useThree();

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        gl.setPixelRatio(window.devicePixelRatio);
        gl.setSize(window.innerWidth, window.innerHeight);
        window.dispatchEvent(new Event("resize"));
      }, 50);
    }
  }, [open]);

  return null;
}

function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<Mesh>(null);
  const texture = useLoader(TextureLoader, imageUrl);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = SRGBColorSpace;

      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
    }

    return () => {
      texture?.dispose();
    };
  }, [texture]);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={BackSide} />
    </mesh>
  );
}

function CameraController() {
  const lon = useRef(0);
  const lat = useRef(0);
  const isDown = useRef(false);
  const downX = useRef(0);
  const downY = useRef(0);
  const downLon = useRef(0);
  const downLat = useRef(0);

  useEffect(() => {
    const dom = document.querySelector(".panorama-canvas canvas");
    if (!dom) return;

    const onDown = (e: PointerEvent) => {
      isDown.current = true;
      downX.current = e.clientX;
      downY.current = e.clientY;
      downLon.current = lon.current;
      downLat.current = lat.current;
    };

    const onMove = (e: PointerEvent) => {
      if (!isDown.current) return;
      lon.current = downLon.current + (downX.current - e.clientX) * 0.1;
      lat.current = downLat.current + (e.clientY - downY.current) * 0.1;
      lat.current = Math.max(-85, Math.min(85, lat.current));
    };

    const onUp = () => (isDown.current = false);

    dom.addEventListener("pointerdown", onDown as EventListener);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      dom.removeEventListener("pointerdown", onDown as EventListener);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  useFrame(({ camera }) => {
    lon.current += !isDown.current ? 0.02 : 0;

    const phi = ((90 - lat.current) * Math.PI) / 180;
    const theta = (lon.current * Math.PI) / 180;

    const x = 0.1 * Math.sin(phi) * Math.cos(theta);
    const y = 0.1 * Math.cos(phi);
    const z = 0.1 * Math.sin(phi) * Math.sin(theta);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

export default function PanoramaViewerModal({
  open,
  src,
  onClose,
  fallbackSrc = "",
}: Props) {
  const imageUrl = src.url || fallbackSrc;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    setLoaded(false);

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true);

    return () => {
      Cache.clear();
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!open) {
      setLoaded(false);
      Cache.clear();
    }
  }, [open]);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      className="panorama-viewer"
      wrapClassName="panorama-viewer-wrap"
      centered={false}
      width="100%"
      destroyOnHidden
      style={{ top: 0, margin: 0 }}
      styles={{ body: { padding: 0 } }}
      forceRender
      modalRender={(node) => node}
    >
      <div className="panorama-canvas relative bg-white">
        <button
          onClick={onClose}
          className="absolute z-40 top-4 right-4 text-black px-3 py-1 rounded-md shadow"
          data-testid="viewer-close-btn"
        >
          <CloseOutlined />
        </button>

        {/* {!loaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90">
            <Spin size="large" tip="Loading panorama..." />
          </div>
        )} */}

        <div className="absolute z-40 left-4 top-4 text-white text-sm px-3 py-1 rounded-md bg-black/50 backdrop-blur-sm">
          {src?.name || "Panorama View"}
        </div>

        <div
          className="canvas-container w-full h-[100vh]"
          data-testid="panorama-viewer"
        >
          <Canvas
            gl={{
              antialias: true,
              preserveDrawingBuffer: true,
              powerPreference: "high-performance",
            }}
            dpr={[1, 2]}
          >
            <FixCanvasOnOpen open={open} />
            <Suspense
              fallback={
                <Html center className="w-full">
                  <Spin size="large" tip="Loading panorama..." />
                </Html>
              }
            >
              <PanoramaSphere key={imageUrl} imageUrl={imageUrl} />
              <CameraController />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </Modal>
  );
}
