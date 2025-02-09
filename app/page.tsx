"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

import "./page.scss";
import { start } from "repl";

export default function Home() {
  // let canvas: HTMLCanvasElement
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let model: THREE.Group;

  useEffect(() => {
    const gui = new GUI();

    // canvas
    const canvas = canvasRef.current;
    // nullであれば処理を進めない
    if (canvas === null) {
      return;
    }

    // scene
    const scene: THREE.Scene = new THREE.Scene();

    const sizes = {
      width: innerWidth,
      height: innerHeight,
    };

    // camera
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );

    // renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // gltfファイル読み込み
    // 初期化
    const gltfLoader = new GLTFLoader();
    // ファイルを読み込みシーンに追加
    gltfLoader.load("/table.glb", (gltf) => {
      model = gltf.scene;
      model.scale.set(0.7, 0.7, 0.7);
      // model.rotation.x = Math.PI / 3
      scene.add(gltf.scene);
    });
    // 照明を追加
    /* spotLight */
    const spotLight = new THREE.SpotLight(0xffffff, 1, 10, Math.PI * 0.5);
    scene.add(spotLight);
    gui.add(spotLight, "intensity").min(0).max(10).step(0.1);
    gui.add(spotLight, "angle").min(0).max(Math.PI).step(0.01);
    gui.add(spotLight, "penumbra").min(0).max(1).step(0.01);
    gui.show(false);

    /* pointLight */
    const pointLight = new THREE.PointLight(0xffffff, 0, 0);
    scene.add(pointLight);

    // カメラの位置をGUIで操作
    const cameraFolder = gui.addFolder("camera position");
    cameraFolder.add(camera.position, "x").min(-10).max(20).step(0.1);
    cameraFolder.add(camera.position, "y").min(-10).max(20).step(0.1);
    cameraFolder.add(camera.position, "z").min(-10).max(20).step(0.1);

    // scrollアニメーション

    // スクロール量の割合
    let scrollPercent = 0;

    // 画面のスクロール幅
    const handleScroll = () => {
      scrollPercent =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
    };

    // アニメーションの型
    interface animationProps {
      start: number;
      end: number;
      function: () => void;
    }

    // 線形補間
    const lerp = (x: number, y: number, a: number) => {
      return (1 - a) * x + a * y;
    };

    const getCoefficient = (start: number, end: number) => {
      const coefficient = (scrollPercent - start) / (end - start);
      return Math.min(Math.max(coefficient, 0), 1);
    };

    // アニメーションの配列
    const animationArray: animationProps[] = [];
    // アニメーションの定義
    animationArray.push({
      start: 0,
      end: 40,
      function: () => {
        if (model) {
          camera.lookAt(model.position);
          camera.position.set(0, 1, -20);
          camera.position.y = lerp(1, 5, getCoefficient(0, 40));
          camera.position.z = lerp(-20, 0, getCoefficient(0, 40));
        }
      },
    });
    animationArray.push({
      start: 40,
      end: 60,
      function: () => {
        if (model) {
          camera.lookAt(model.position);
          camera.position.x = lerp(0, 0, getCoefficient(40, 60));
          camera.position.y = lerp(5, 3, getCoefficient(40, 60));
          // camera.position.z = lerp(-20, 0, getCoefficient(40, 60));
        }
      },
    });
    animationArray.push({
      start: 60,
      end: 80,
      function: () => {
        if (model) {
          camera.lookAt(model.position);
          camera.position.x = lerp(0, 5, getCoefficient(60, 80));
          camera.position.y = lerp(3, 5, getCoefficient(60, 80));
          pointLight.intensity = 0;
        }
      },
    });
    animationArray.push({
      start: 80,
      end: 100,
      function: () => {
        pointLight.intensity = 1.5;
        pointLight.distance = 20;
      },
    });

    // アニメーションの実行
    const playScrollAnimation = () =>
      animationArray.forEach((animation) => {
        if (
          scrollPercent >= animation.start &&
          scrollPercent <= animation.end
        ) {
          animation.function();
        }
      });

    // animation
    const tick = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
      playScrollAnimation();
      // アニメーション実行
    };
    tick();

    // リサイズ
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    // リサイズイベント実行
    window.addEventListener("resize", handleResize);
    // スクロールイベント実行
    window.addEventListener("scroll", handleScroll);
    // マウスムーブイベント実行
    // window.addEventListener("mousemove", handleMousemove);
  }, []);
  return (
    <>
      <canvas id="canvas" ref={canvasRef}></canvas>

      <div className="mainContents">
        <section>
          <h2>first</h2>
          <p>
          There is a table in the back on a pink floor in the dark, illuminated by a small light.
          </p>
        </section>
        <section>
          <h2>second</h2>
          <p>
          You approach the table. It is a wooden table with a brown base accented with green.
          </p>
        </section>
        <section>
          <h2>third</h2>
          <p>
          You are looking at the table from directly above. It is slowly rotating counterclockwise.
          </p>
        </section>
        <section>
          <h2>forth</h2>
          <p>
          You step back from the table again, and finally, a strong spotlight shines directly in the middle between the table and the chair.
          </p>
        </section>
      </div>
    </>
  );
}

/* ambientLight */
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
// ambientLight.color = new THREE.Color(0xffffff)
// ambientLight.intensity = 1
// scene.add(ambientLight)
// gui.add(ambientLight, 'intensity').min(0).max(3).step(0.01)   // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

/* directionalLight */
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(5, 5, 5);
// scene.add(directionalLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
// directionalLight.position.set(1, 0.55, 0)
// scene.add(directionalLight)

/* hemiSphereLight */
// const hemiSphereLight = new THREE.HemisphereLight(0x0ffff0, 0xffff00, 1)
// hemiSphereLight.position.set(1, 2, 0)
// scene.add(hemiSphereLight)

/* pointLight */
// const pointLight = new THREE.PointLight(0xffffff, 1.5, 10)
// pointLight.position.set(0, 2, 0)
// scene.add(pointLight)
// gui.add(pointLight, 'intensity').min(0).max(10).step(0.01)
// gui.add(pointLight, 'distance').min(0).max(10).step(0.01)

/* rectAreaLight */
// const rectAreaLight = new THREE.RectAreaLight(0xffffff, 1.5, 10)
// scene.add(rectAreaLight)
// rectAreaLight.position.set(0, 2, 0)
// gui.add(pointLight, 'intensity').min(0).max(10).step(0.01)
// gui.add(pointLight, 'distance').min(0).max(10).step(0.01)
