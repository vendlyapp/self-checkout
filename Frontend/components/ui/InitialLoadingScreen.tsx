'use client';

import React from 'react';
import { Loader } from './Loader';

interface InitialLoadingScreenProps {
  message?: string;
}

/**
 * Pantalla de carga inicial - Wrapper alrededor del componente Loader estándar
 * Mantiene compatibilidad hacia atrás mientras usa el nuevo sistema unificado
 */
const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ 
  message = "Cargando..." 
}) => {
  return <Loader variant="fullscreen" message={message} />;
};

export default InitialLoadingScreen;

