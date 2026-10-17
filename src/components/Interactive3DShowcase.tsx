import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  RotateCw, 
  Layers, 
  ShoppingBag, 
  Smartphone, 
  Headphones, 
  Watch, 
  Footprints,
  ShieldCheck,
  ArrowRight,
  Play,
  Scale,
  Tv
} from 'lucide-react';
import { ProductCategory, Product, StoreViewMode } from '../types';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

interface Interactive3DShowcaseProps {
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  onNavigate?: (view: StoreViewMode) => void;
}

type ModelType = 'phone' | 'earbuds' | 'watch' | 'sneaker';

interface ShowcaseItem {
  id: string;
  type: ModelType;
  title: string;
  subtitle: string;
  brand: string;
  category: ProductCategory;
  price: number;
  compareAtPrice: number;
  rating: number;
  reviews: number;
  badge: string;
  image: string;
  videoUrl: string;
  specs: Record<string, string>;
}

const SHOWCASE_ITEMS: Record<ModelType, ShowcaseItem> = {
  phone: {
    id: 'showcase-s24-ultra',
    type: 'phone',
    title: 'Samsung Galaxy S24 Ultra Titanium 5G (12GB/512GB)',
    subtitle: 'Samsung Galaxy S24 Ultra Titanium Flagship Edition',
    brand: 'Samsung Official',
    category: 'mobiles-tablets',
    price: 389999,
    compareAtPrice: 429999,
    rating: 4.9,
    reviews: 840,
    badge: 'FLAGSHIP NO. 1',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    specs: {
      'Display': '6.8" Dynamic AMOLED 2X 120Hz',
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'Camera': '200MP Quad Telephoto Matrix',
      'Battery': '5000 mAh 45W Fast Charging',
      'Warranty': '1 Year Official PTA Approved',
    },
  },
  earbuds: {
    id: 'showcase-airpods-pro',
    type: 'earbuds',
    title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)',
    subtitle: 'Apple AirPods Pro 2nd Gen Active Noise Cancellation',
    brand: 'Apple Official',
    category: 'audio-sound',
    price: 64999,
    compareAtPrice: 79999,
    rating: 4.9,
    reviews: 1250,
    badge: 'PRO AUDIO CHOICE',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    specs: {
      'ANC': '2x Active Noise Cancellation',
      'Audio': 'Personalized Spatial Audio',
      'Battery Life': 'Up to 30 Hours with Case',
      'Connectivity': 'Bluetooth 5.3 + Apple H2 Chip',
      'Warranty': '7 Days Checking + Official Apple',
    },
  },
  watch: {
    id: 'showcase-watch-ultra',
    type: 'watch',
    title: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
    subtitle: 'Apple Watch Ultra 2 Titanium Rugged Adventure Smartwatch',
    brand: 'Apple Official',
    category: 'electronics',
    price: 235000,
    compareAtPrice: 265000,
    rating: 4.8,
    reviews: 490,
    badge: 'TITANIUM ADVENTURE',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    specs: {
      'Case': '49mm Aerospace Titanium Case',
      'Display': '3000 nits Always-On Retina OLED',
      'Sensors': 'ECG, Blood Oxygen, Depth Gauge',
      'Water Resistance': '100m Water Resistant',
      'Battery': '36 Hours Normal / 72h Low Power',
    },
  },
  sneaker: {
    id: 'showcase-nike-air',
    type: 'sneaker',
    title: 'Nike Air Max Cushion Breathable Athletic Running Joggers',
    subtitle: 'Nike Air Max Breathable Athletic Running Footwear',
    brand: 'Nike Sports',
    category: 'sports-outdoor',
    price: 18500,
    compareAtPrice: 24999,
    rating: 4.7,
    reviews: 930,
    badge: 'SPORTS BESTSELLER',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    specs: {
      'Cushioning': 'Air Max Gas Unit in Heel',
      'Upper': 'Engineered Breathable Mesh',
      'Sole': 'Anti-Skid Waffle Rubber Tread',
      'Origin': '100% Authentic Import',
      'Warranty': '7 Days Exchange Warranty',
    },
  },
};

interface ColorTheme {
  name: string;
  color: number;
  roughness: number;
  metalness: number;
}

const COLOR_THEMES: Record<string, ColorTheme> = {
  daraz_orange: { name: 'Flame Orange', color: 0xf85606, roughness: 0.2, metalness: 0.85 },
  phantom_black: { name: 'Phantom Black', color: 0x1e293b, roughness: 0.2, metalness: 0.85 },
  titanium_silver: { name: 'Titanium Silver', color: 0xd8dee9, roughness: 0.15, metalness: 0.95 },
  emerald_luxury: { name: 'Emerald Luxury', color: 0x059669, roughness: 0.25, metalness: 0.75 },
};

export const Interactive3DShowcase: React.FC<Interactive3DShowcaseProps> = ({
  onSelectCategory,
}) => {
  const { openVideoModal, toggleCompare, isInCompare } = useCompare();
  const { addToCart } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeModel, setActiveModel] = useState<ModelType>('phone');
  const [activeColor, setActiveColor] = useState<string>('daraz_orange');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [viewMode, setViewMode] = useState<'3d_model' | 'live_ad'>('3d_model');

  const currentItem = SHOWCASE_ITEMS[activeModel];
  const inCompare = isInCompare(currentItem.id);

  // References to three.js objects
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const autoRotateRef = useRef(true);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    autoRotateRef.current = isAutoRotating;
  }, [isAutoRotating]);

  // Update materials when color theme or wireframe changes
  useEffect(() => {
    const theme = COLOR_THEMES[activeColor] || COLOR_THEMES.daraz_orange;
    materialsRef.current.forEach((mat) => {
      mat.color.setHex(theme.color);
      mat.roughness = theme.roughness;
      mat.metalness = theme.metalness;
      mat.wireframe = isWireframe;
      mat.needsUpdate = true;
    });
  }, [activeColor, isWireframe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 2.8);
    keyLight.position.set(6, 9, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    fillLight.position.set(-6, 3, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf97316, 1.4);
    rimLight.position.set(-5, -4, -4);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(0xffedd5, 2, 20);
    pointLight.position.set(0, 4, 4);
    scene.add(pointLight);

    // 3. Studio Ground Pedestal Ring
    const ringGeo = new THREE.TorusGeometry(3.2, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xf85606, 
      transparent: true, 
      opacity: 0.25 
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    ring.position.y = -2.2;
    scene.add(ring);

    // 4. Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;
    materialsRef.current = [];

    // Helper: Create a canvas texture for the phone screen with running product ad graphics
    const createAdScreenTexture = (item: ShowcaseItem) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const grad = ctx.createLinearGradient(0, 0, 0, 1024);
      grad.addColorStop(0, '#f85606');
      grad.addColorStop(0.15, '#ffffff');
      grad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 1024);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 50);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('9:41', 30, 36);
      ctx.fillText('5G   100%', 400, 36);

      ctx.fillStyle = '#f85606';
      ctx.fillRect(0, 50, 512, 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText('Easy Store   Verified Mall', 30, 95);

      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(30, 140, 452, 60);
      ctx.fillStyle = '#c2410c';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('  MEGA 10s AD SALE   100% ORIGINAL', 45, 178);

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 15;
      ctx.fillRect(30, 220, 452, 480);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 28px system-ui, sans-serif';
      const shortTitle = item.title.slice(0, 24);
      ctx.fillText(shortTitle, 50, 280);

      ctx.fillStyle = '#f85606';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText(`Rs. ${item.price.toLocaleString()}`, 50, 340);

      ctx.fillStyle = '#64748b';
      ctx.font = '22px system-ui, sans-serif';
      ctx.fillText(`M.R.P: Rs. ${item.compareAtPrice.toLocaleString()}`, 50, 380);

      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(50, 420, 412, 50);
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('  Trade Assurance Verified', 65, 452);

      ctx.fillStyle = '#fff7ed';
      ctx.fillRect(50, 490, 412, 50);
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('  Free Cash on Delivery Nationwide', 65, 522);

      ctx.fillStyle = '#f85606';
      ctx.fillRect(50, 560, 412, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('  Tap to Watch 10s Video Ad', 90, 598);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 940, 512, 84);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('  50,000+ Products Live on Easy Store', 55, 990);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const currentTheme = COLOR_THEMES[activeColor] || COLOR_THEMES.daraz_orange;

    const createProductMesh = (type: ModelType) => {
      while (modelGroup.children.length > 0) {
        const obj = modelGroup.children[0] as THREE.Mesh;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
        modelGroup.remove(obj);
      }
      materialsRef.current = [];

      const bodyMat = new THREE.MeshStandardMaterial({
        color: currentTheme.color,
        roughness: currentTheme.roughness,
        metalness: currentTheme.metalness,
        wireframe: isWireframe,
      });
      materialsRef.current.push(bodyMat);

      const adTexture = createAdScreenTexture(currentItem);
      const screenMat = adTexture ? new THREE.MeshStandardMaterial({
        map: adTexture,
        roughness: 0.1,
        metalness: 0.1,
      }) : new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.8,
      });

      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.05,
        metalness: 0.95,
      });

      const accentMat = new THREE.MeshStandardMaterial({
        color: 0xf85606,
        roughness: 0.2,
      });

      if (type === 'phone') {
        const bodyGeo = new THREE.BoxGeometry(2.4, 4.6, 0.28);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        modelGroup.add(body);

        const screenGeo = new THREE.BoxGeometry(2.26, 4.46, 0.02);
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.z = 0.15;
        modelGroup.add(screen);

        const bumpGeo = new THREE.BoxGeometry(0.9, 1.4, 0.12);
        const bump = new THREE.Mesh(bumpGeo, bodyMat);
        bump.position.set(-0.6, 1.4, -0.19);
        modelGroup.add(bump);

        for (let i = 0; i < 3; i++) {
          const lensGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 24);
          const lens = new THREE.Mesh(lensGeo, glassMat);
          lens.rotation.x = Math.PI / 2;
          lens.position.set(-0.6, 1.8 - i * 0.4, -0.25);
          modelGroup.add(lens);
        }
      } else if (type === 'earbuds') {
        const podGeo = new THREE.CylinderGeometry(1.5, 1.3, 1.8, 32);
        const pod = new THREE.Mesh(podGeo, bodyMat);
        pod.position.y = -0.5;
        modelGroup.add(pod);

        const budLeftGeo = new THREE.SphereGeometry(0.45, 24, 24);
        const budLeft = new THREE.Mesh(budLeftGeo, accentMat);
        budLeft.position.set(-0.9, 1.1, 0.2);
        modelGroup.add(budLeft);

        const stemLeftGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.1, 16);
        const stemLeft = new THREE.Mesh(stemLeftGeo, bodyMat);
        stemLeft.position.set(-0.9, 0.6, 0.2);
        stemLeft.rotation.z = 0.2;
        modelGroup.add(stemLeft);

        const budRightGeo = new THREE.SphereGeometry(0.45, 24, 24);
        const budRight = new THREE.Mesh(budRightGeo, accentMat);
        budRight.position.set(0.9, 1.1, 0.2);
        modelGroup.add(budRight);

        const stemRightGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.1, 16);
        const stemRight = new THREE.Mesh(stemRightGeo, bodyMat);
        stemRight.position.set(0.9, 0.6, 0.2);
        stemRight.rotation.z = -0.2;
        modelGroup.add(stemRight);
      } else if (type === 'watch') {
        const caseGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.36, 36);
        const watchCase = new THREE.Mesh(caseGeo, bodyMat);
        watchCase.rotation.x = Math.PI / 2;
        modelGroup.add(watchCase);

        const dialGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.05, 36);
        const dial = new THREE.Mesh(dialGeo, screenMat);
        dial.rotation.x = Math.PI / 2;
        dial.position.z = 0.18;
        modelGroup.add(dial);

        const crownGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
        const crown = new THREE.Mesh(crownGeo, accentMat);
        crown.position.set(1.7, 0.3, 0);
        modelGroup.add(crown);

        const strapGeo = new THREE.BoxGeometry(1.5, 2.2, 0.18);
        const strapUp = new THREE.Mesh(strapGeo, bodyMat);
        strapUp.position.set(0, 2.2, 0);
        modelGroup.add(strapUp);

        const strapDown = new THREE.Mesh(strapGeo, bodyMat);
        strapDown.position.set(0, -2.2, 0);
        modelGroup.add(strapDown);
      } else if (type === 'sneaker') {
        const soleGeo = new THREE.BoxGeometry(1.8, 0.45, 4.2);
        const sole = new THREE.Mesh(soleGeo, bodyMat);
        sole.position.y = -1.2;
        modelGroup.add(sole);

        const airUnitGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 16);
        const airUnit = new THREE.Mesh(airUnitGeo, accentMat);
        airUnit.rotation.x = Math.PI / 2;
        airUnit.position.set(0, -1.15, -0.9);
        modelGroup.add(airUnit);

        const upperGeo = new THREE.ConeGeometry(1.3, 3.4, 32);
        const upper = new THREE.Mesh(upperGeo, bodyMat);
        upper.rotation.x = Math.PI / 2.3;
        upper.position.set(0, -0.2, 0.3);
        modelGroup.add(upper);

        const collarGeo = new THREE.TorusGeometry(0.7, 0.25, 16, 32);
        const collar = new THREE.Mesh(collarGeo, accentMat);
        collar.rotation.x = Math.PI / 2;
        collar.position.set(0, 0.6, -0.8);
        modelGroup.add(collar);
      }
    };

    createProductMesh(activeModel);
    modelGroup.rotation.x = 0.25;
    modelGroup.rotation.y = -0.35;

    // 5. Interactive Mouse & Touch Drag Controls
    const dom = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      setIsInteracting(true);
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      modelGroupRef.current.rotation.y += deltaX * 0.01;
      modelGroupRef.current.rotation.x += deltaY * 0.01;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        setIsInteracting(true);
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !modelGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

      modelGroupRef.current.rotation.y += deltaX * 0.01;
      modelGroupRef.current.rotation.x += deltaY * 0.01;
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      setTimeout(() => setIsInteracting(false), 800);
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (modelGroupRef.current) {
        modelGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
        if (autoRotateRef.current && !isDraggingRef.current) {
          modelGroupRef.current.rotation.y += 0.008;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 420;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animationFrameId);

      ringGeo.dispose();
      ringMat.dispose();
      while (modelGroup.children.length > 0) {
        const obj = modelGroup.children[0] as THREE.Mesh;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
        modelGroup.remove(obj);
      }
      renderer.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [activeModel, currentItem]);

  const toProduct = (item: ShowcaseItem): Product => ({
    id: item.id,
    name: item.title,
    slug: item.id,
    category: item.category,
    brand: item.brand,
    price: item.price,
    compareAtPrice: item.compareAtPrice,
    stock: 50,
    sku: `PK-3D-${item.type.toUpperCase()}`,
    description: `Official ${item.title}. 100% Genuine with Free Cash on Delivery all across Pakistan.`,
    shortDescription: item.subtitle,
    images: [item.image],
    rating: item.rating,
    reviewCount: item.reviews,
    featured: true,
    bestSeller: true,
    specs: item.specs,
    videoUrl: item.videoUrl,
    videoDuration: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8 text-slate-800 my-8">
      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-300/80 text-[#f85606] text-xs font-black tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Interactive 3D Product Lab &amp; 10s Mobile Video Ad</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Explore Flagship Products &amp; 10s Ad Videos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Interactive 360-degree 3D preview and 10-second mobile video ad showcase.
          </p>
        </div>

        {/* View Mode & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('3d_model')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '3d_model'
                  ? 'bg-white text-[#f85606] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>3D 360  Studio</span>
            </button>
            <button
              onClick={() => setViewMode('live_ad')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'live_ad'
                  ? 'bg-[#f85606] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Mobile Ad Screen</span>
            </button>
          </div>

          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isAutoRotating 
                ? 'bg-[#f85606] text-white border-[#f85606] shadow-sm shadow-orange-500/30' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
            <span>Auto Rotate</span>
          </button>

          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isWireframe 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Viewport (3D or Live Mobile Ad), Right Specs & Actions */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
        {/* Left Viewport */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {viewMode === '3d_model' ? (
            <div 
              ref={containerRef} 
              className="w-full h-[320px] sm:h-[400px] rounded-2xl relative cursor-grab active:cursor-grabbing select-none bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-inner flex items-center justify-center"
              title="Click and drag to rotate in 3D"
            >
              <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 text-[11px] text-slate-700 font-bold shadow-sm pointer-events-none transition-opacity duration-300 ${isInteracting ? 'opacity-30' : 'opacity-90'}`}>
                Drag to rotate 360  Original image textured on screen
              </div>

              <button
                onClick={() => openVideoModal(toProduct(currentItem))}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-[#f85606] text-white text-xs font-black flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-md z-10"
              >
                <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Play 10s Video</span>
              </button>
            </div>
          ) : (
            <div className="w-full h-[320px] sm:h-[400px] rounded-2xl bg-slate-950 p-4 flex items-center justify-center relative overflow-hidden border border-slate-800 shadow-xl">
              <div className="max-w-xs w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 flex flex-col">
                <div className="bg-[#f85606] px-4 py-2 flex items-center justify-between text-white text-[10px] font-bold">
                  <span>9:41</span>
                  <span>Easy Store Pakistan   Live Ad</span>
                  <span>5G 100%</span>
                </div>
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    SAVE {Math.round(((currentItem.compareAtPrice - currentItem.price) / currentItem.compareAtPrice) * 100)}%
                  </div>
                  <button
                    onClick={() => openVideoModal(toProduct(currentItem))}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#f85606]/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
                <div className="p-3 bg-white space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#f85606] uppercase">{currentItem.badge}</span>
                    <span className="text-emerald-600 font-bold">Free COD</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate">{currentItem.title}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-[#f85606]">Rs. {currentItem.price.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 line-through">Rs. {currentItem.compareAtPrice.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => addToCart(toProduct(currentItem), 1)}
                    className="w-full py-1.5 bg-[#f85606] text-white rounded-lg text-xs font-black hover:bg-[#e04c00] transition-colors cursor-pointer"
                  >
                    Order on Cash on Delivery
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Model Switcher Tabs */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
            {[
              { id: 'phone' as ModelType, name: 'Samsung S24 Ultra', icon: Smartphone },
              { id: 'earbuds' as ModelType, name: 'AirPods Pro 2', icon: Headphones },
              { id: 'watch' as ModelType, name: 'Apple Watch Ultra', icon: Watch },
              { id: 'sneaker' as ModelType, name: 'Nike Air Max', icon: Footprints },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeModel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModel(item.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#f85606] text-white border-[#f85606] shadow-md shadow-orange-500/25 ring-2 ring-orange-300/50'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Product Detail Panel */}
        <div className="lg:col-span-5 space-y-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#f85606] text-white uppercase tracking-wider shadow-2xs">
                {currentItem.badge}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Trade Assurance</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {currentItem.title}
            </h3>
            <p className="text-xs text-[#f85606] font-bold mt-1">
              {currentItem.subtitle}
            </p>
          </div>

          <div className="flex items-baseline gap-2.5 p-3 rounded-xl bg-orange-50/60 border border-orange-100">
            <span className="text-2xl font-black text-[#f85606]">
              Rs. {currentItem.price.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 line-through">
              Rs. {currentItem.compareAtPrice.toLocaleString()}
            </span>
            <span className="text-xs font-black text-emerald-600 ml-auto">
              Save {Math.round(((currentItem.compareAtPrice - currentItem.price) / currentItem.compareAtPrice) * 100)}%
            </span>
          </div>

          {/* Color Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              3D Chassis Finish: <span className="text-[#f85606] font-black">{COLOR_THEMES[activeColor]?.name}</span>
            </label>
            <div className="flex items-center gap-3">
              {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setActiveColor(key)}
                  title={theme.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    activeColor === key ? 'ring-3 ring-[#f85606] scale-110 shadow-md' : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: `#${theme.color.toString(16).padStart(6, '0')}`,
                    border: '2px solid rgba(0,0,0,0.15)',
                  }}
                >
                  {activeColor === key && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 py-2 border-y border-slate-100 text-xs">
            {Object.entries(currentItem.specs).slice(0, 4).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">{k}:</span>
                <span className="font-bold text-slate-800">{v}</span>
              </div>
            ))}
          </div>

          {/* Quick Dual Actions: 10s Video Ad & Compare Side-by-Side */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openVideoModal(toProduct(currentItem))}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Watch 10s Ad Video</span>
            </button>
            <button
              onClick={() => toggleCompare(toProduct(currentItem))}
              className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                inCompare
                  ? 'bg-orange-50 border-[#f85606] text-[#f85606]'
                  : 'bg-white border-slate-200 hover:border-orange-300 text-slate-700'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-[#f85606]" />
              <span>{inCompare ? 'In Comparison' : 'Add to Compare'}</span>
            </button>
          </div>

          {/* Add to Cart & Explore in Store Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => addToCart(toProduct(currentItem), 1)}
              className="py-3 px-3 bg-[#f85606] hover:bg-[#e04c00] text-white font-black rounded-xl text-xs transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={() => {
                onSelectCategory(currentItem.category);
                window.scrollTo({ top: 920, behavior: 'smooth' });
              }}
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Explore Category</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
