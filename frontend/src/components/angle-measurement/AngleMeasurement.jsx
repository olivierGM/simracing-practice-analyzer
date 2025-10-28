/**
 * Composant AngleMeasurement
 * 
 * Outil de mesure d'angles sur image
 * - Upload d'image
 * - Placement de points pour créer des segments
 * - Calcul et affichage d'angles
 * - Téléchargement de l'image annotée
 */

import { useState, useRef, useEffect } from 'react';
import './AngleMeasurement.css';

// Types de mesures possibles
const MEASUREMENT_TYPES = {
  SEGMENT_ANGLE: 'segment_angle', // Angle entre deux segments (3 points)
  LINE_ANGLE: 'line_angle' // Angle d'une ligne par rapport à l'horizontale/verticale (2 points)
};

export function AngleMeasurement() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [currentMode, setCurrentMode] = useState(MEASUREMENT_TYPES.SEGMENT_ANGLE);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textSize, setTextSize] = useState(30); // Taille du texte en pixels (defaut: 30)
  const [isDragging, setIsDragging] = useState(false);
  const [dragPoint, setDragPoint] = useState(null); // Point temporaire pendant le drag
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Charger l'image sur le canvas
  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Ajuster la taille du canvas à l'image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Dessiner l'image
        ctx.drawImage(img, 0, 0);
        
        // Redessiner toutes les mesures existantes
        redrawMeasurements();
      };
      
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Redessiner toutes les mesures
  useEffect(() => {
    if (imageUrl) {
      redrawMeasurements();
    }
  }, [measurements, currentPoints, currentMode, textSize, isDragging, dragPoint]);

  const redrawMeasurements = () => {
    if (!canvasRef.current || !imageUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Réinitialiser le canvas
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Dessiner toutes les mesures existantes
      measurements.forEach((measurement, index) => {
        drawMeasurement(ctx, measurement, index);
      });
      
      // Dessiner la mesure en cours
      if (currentPoints.length > 0) {
        drawCurrentMeasurement(ctx);
      }
    };
    img.src = imageUrl;
  };

  // Dessiner une mesure
  const drawMeasurement = (ctx, measurement, index) => {
    const { type, points, angle } = measurement;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#00ff00';
    
    if (type === MEASUREMENT_TYPES.SEGMENT_ANGLE && points.length === 3) {
      // Dessiner les deux segments qui forment l'angle
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.lineTo(points[2].x, points[2].y);
      ctx.stroke();
      
      // Dessiner les points
      points.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Afficher l'angle au point central
      const fontSize = textSize;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = points[1].x;
      const centerY = points[1].y;
      const text = `${angle.toFixed(1)}°`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      const padding = 6;
      
      // Fond pour le texte
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(centerX - textWidth / 2 - padding, centerY - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2);
      
      // Bordure du fond
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - textWidth / 2 - padding, centerY - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2);
      
      // Texte
      ctx.fillStyle = '#000000';
      ctx.fillText(text, centerX, centerY);
      
    } else if (type === MEASUREMENT_TYPES.LINE_ANGLE && points.length === 2) {
      // Dessiner la ligne
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
      
      // Dessiner les points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Afficher l'angle au milieu de la ligne
      const midX = (points[0].x + points[1].x) / 2;
      const midY = (points[0].y + points[1].y) / 2;
      
      const fontSize = textSize;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = `${angle.toFixed(1)}°`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      const padding = 6;
      
      // Fond pour le texte
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(midX - textWidth / 2 - padding, midY - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2);
      
      // Bordure du fond
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(midX - textWidth / 2 - padding, midY - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2);
      
      // Texte
      ctx.fillStyle = '#000000';
      ctx.fillText(text, midX, midY);
    }
  };

  // Dessiner la mesure en cours
  const drawCurrentMeasurement = (ctx) => {
    if (currentPoints.length === 0 && !isDragging) return;
    
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ffff00';
    
    if (currentMode === MEASUREMENT_TYPES.SEGMENT_ANGLE) {
      if (currentPoints.length >= 1) {
        // Dessiner depuis le dernier point vers le point de drag ou attendre le prochain clic
        const startPoint = currentPoints[currentPoints.length - 1];
        
        if (isDragging && dragPoint) {
          // Ligne temporaire pendant le drag
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(dragPoint.x, dragPoint.y);
          ctx.setLineDash([5, 5]); // Ligne pointillée pour le drag
          ctx.stroke();
          ctx.setLineDash([]); // Réinitialiser
        }
        
        // Dessiner les segments déjà complétés
        if (currentPoints.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
          ctx.lineTo(currentPoints[1].x, currentPoints[1].y);
          ctx.stroke();
        }
        if (currentPoints.length === 3) {
          ctx.lineTo(currentPoints[2].x, currentPoints[2].y);
          ctx.stroke();
        }
      }
    } else if (currentMode === MEASUREMENT_TYPES.LINE_ANGLE) {
      if (currentPoints.length === 1 && isDragging && dragPoint) {
        // Ligne temporaire pendant le drag
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        ctx.lineTo(dragPoint.x, dragPoint.y);
        ctx.setLineDash([5, 5]); // Ligne pointillée pour le drag
        ctx.stroke();
        ctx.setLineDash([]); // Réinitialiser
      } else if (currentPoints.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        ctx.lineTo(currentPoints[1].x, currentPoints[1].y);
        ctx.stroke();
      }
    }
    
    // Dessiner les points fixés
    currentPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Dessiner le point temporaire pendant le drag
    if (isDragging && dragPoint) {
      ctx.fillStyle = '#ffff00';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(dragPoint.x, dragPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  };

  // Calculer l'angle entre deux segments (3 points)
  const calculateSegmentAngle = (p1, p2, p3) => {
    // Vecteurs
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    
    // Angles des vecteurs
    const angle1 = Math.atan2(v1.y, v1.x);
    const angle2 = Math.atan2(v2.y, v2.x);
    
    // Angle entre les deux vecteurs
    let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
    
    // S'assurer que l'angle est entre 0 et 180
    if (angle > 180) {
      angle = 360 - angle;
    }
    
    return angle;
  };

  // Calculer l'angle d'une ligne par rapport à l'horizontale
  const calculateLineAngle = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    // Angle en degrés par rapport à l'horizontale
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normaliser entre 0 et 360
    return angle < 0 ? angle + 360 : angle;
  };

  // Convertir les coordonnées de l'événement en coordonnées canvas
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Ajuster les coordonnées selon le ratio d'affichage
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: x * scaleX,
      y: y * scaleY
    };
  };

  // Gérer le début du drag (mousedown/touchstart)
  const handleCanvasMouseDown = (e) => {
    if (!imageUrl) return;
    
    // Vérifier si on a déjà tous les points nécessaires
    const maxPoints = currentMode === MEASUREMENT_TYPES.SEGMENT_ANGLE ? 3 : 2;
    if (currentPoints.length >= maxPoints) return;
    
    const point = getCanvasCoordinates(e);
    if (!point) return;
    
    setIsDragging(true);
    setDragPoint(point);
    
    // Empêcher le comportement par défaut (scrolling, etc.)
    e.preventDefault();
  };

  // Gérer le mouvement pendant le drag (mousemove/touchmove)
  const handleCanvasMouseMove = (e) => {
    if (!imageUrl || !isDragging) return;
    
    const point = getCanvasCoordinates(e);
    if (!point) return;
    
    setDragPoint(point);
    e.preventDefault();
  };

  // Gérer la fin du drag (mouseup/touchend)
  const handleCanvasMouseUp = (e) => {
    if (!imageUrl || !isDragging || !dragPoint) {
      setIsDragging(false);
      setDragPoint(null);
      return;
    }
    
    // Placer le point au relâchement
    const point = { ...dragPoint };
    const newPoints = [...currentPoints, point];
    setCurrentPoints(newPoints);
    
    setIsDragging(false);
    setDragPoint(null);
    
    // Vérifier si on a terminé une mesure
    if (currentMode === MEASUREMENT_TYPES.SEGMENT_ANGLE) {
      if (newPoints.length === 3) {
        // Calculer l'angle
        const angle = calculateSegmentAngle(newPoints[0], newPoints[1], newPoints[2]);
        
        // Ajouter la mesure
        const measurement = {
          id: Date.now(),
          type: currentMode,
          points: [...newPoints],
          angle
        };
        
        setMeasurements([...measurements, measurement]);
        setCurrentPoints([]);
      }
    } else if (currentMode === MEASUREMENT_TYPES.LINE_ANGLE) {
      if (newPoints.length === 2) {
        // Calculer l'angle
        const angle = calculateLineAngle(newPoints[0], newPoints[1]);
        
        // Ajouter la mesure
        const measurement = {
          id: Date.now(),
          type: currentMode,
          points: [...newPoints],
          angle
        };
        
        setMeasurements([...measurements, measurement]);
        setCurrentPoints([]);
      }
    }
    
    e.preventDefault();
  };

  // Gérer la sortie du canvas pendant le drag (annuler le drag)
  const handleCanvasMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragPoint(null);
    }
  };

  // Gérer l'upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Vérifier le type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('Veuillez sélectionner une image JPG ou PNG');
      return;
    }
    
    // Réinitialiser toutes les mesures et points AVANT de charger la nouvelle image
    setMeasurements([]);
    setCurrentPoints([]);
    setCurrentMode(MEASUREMENT_TYPES.SEGMENT_ANGLE);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(file);
      setImageUrl(event.target.result);
      
      // Nettoyer le canvas si une image précédente était chargée
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    reader.readAsDataURL(file);
  };

  // Supprimer une mesure
  const deleteMeasurement = (id) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  // Réinitialiser
  const reset = () => {
    setMeasurements([]);
    setCurrentPoints([]);
    
    if (canvasRef.current && imageUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      
      img.src = imageUrl;
    }
  };

  // Télécharger l'image annotée
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `angle-measurement-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="angle-measurement-container">
      {/* Contrôles */}
      <div className="angle-measurement-controls">
        {/* Section 1: Import d'image */}
        <div className="control-section">
          <h3 className="section-title">📷 Image</h3>
          <div className="control-group">
            <label htmlFor="image-upload" className="upload-button">
              Importer une image (JPG/PNG)
            </label>
            <input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        
        {imageUrl && (
          <>
            {/* Section 2: Actions */}
            <div className="control-section">
              <h3 className="section-title">⚙️ Actions</h3>
              <div className="control-group">
                <div className="action-buttons">
                  <button onClick={reset} className="secondary-button">
                    🔄 Réinitialiser
                  </button>
                  <button onClick={downloadImage} className="primary-button">
                    💾 Télécharger
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Taille du texte */}
            <div className="control-section">
              <h3 className="section-title">🔤 Taille du texte</h3>
              <div className="control-group">
                <div className="slider-container">
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="text-size-slider"
                  />
                  <div className="slider-label">
                    <span>{textSize}px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Type de mesure */}
            <div className="control-section">
              <h3 className="section-title">📐 Type de mesure</h3>
              <div className="control-group">
                <div className="button-group">
                  <button
                    className={currentMode === MEASUREMENT_TYPES.SEGMENT_ANGLE ? 'active' : ''}
                    onClick={() => {
                      setCurrentMode(MEASUREMENT_TYPES.SEGMENT_ANGLE);
                      setCurrentPoints([]);
                    }}
                  >
                    3 points
                  </button>
                  <button
                    className={currentMode === MEASUREMENT_TYPES.LINE_ANGLE ? 'active' : ''}
                    onClick={() => {
                      setCurrentMode(MEASUREMENT_TYPES.LINE_ANGLE);
                      setCurrentPoints([]);
                    }}
                  >
                    2 points
                  </button>
                </div>
                <div className="measurement-help">
                  {currentMode === MEASUREMENT_TYPES.SEGMENT_ANGLE && (
                    <p className="help-text">Angle entre 2 segments (3 points)</p>
                  )}
                  {currentMode === MEASUREMENT_TYPES.LINE_ANGLE && (
                    <p className="help-text">Angle d'une ligne par rapport à l'horizontale (2 points)</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 5: Instructions */}
            {currentPoints.length > 0 && (
              <div className="measurement-info">
                <p className="info-text">
                  Points sélectionnés : <strong>{currentPoints.length} / {currentMode === MEASUREMENT_TYPES.SEGMENT_ANGLE ? 3 : 2}</strong>
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Canvas */}
      <div className="angle-measurement-canvas-container">
        {imageUrl ? (
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            onTouchStart={handleCanvasMouseDown}
            onTouchMove={handleCanvasMouseMove}
            onTouchEnd={handleCanvasMouseUp}
            className="angle-measurement-canvas"
            style={{
              maxWidth: '100%',
              height: 'auto',
              cursor: isDragging ? 'crosshair' : 'crosshair',
              touchAction: 'none' // Empêcher le scroll sur mobile pendant le drag
            }}
          />
        ) : (
          <div className="upload-placeholder">
            <p>📷 Importez une image pour commencer</p>
            <p>Formats acceptés : JPG, PNG</p>
          </div>
        )}
      </div>
      
      {/* Liste des mesures */}
      {measurements.length > 0 && (
        <div className="measurements-list">
          <h3>Mesures ({measurements.length})</h3>
          <div className="measurements-items">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="measurement-item">
                <span>
                  {measurement.type === MEASUREMENT_TYPES.SEGMENT_ANGLE ? 'Angle entre segments' : 'Angle de ligne'} : 
                  <strong> {measurement.angle.toFixed(1)}°</strong>
                </span>
                <button onClick={() => deleteMeasurement(measurement.id)} className="delete-button">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

