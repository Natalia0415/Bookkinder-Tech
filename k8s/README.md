# Despliegue Bookkinder en Kubernetes (Minikube)

## Componentes
- **Namespace y configuración**: `namespace.yaml`, `configmap.yaml`, `secret.yaml`.
- **MySQL**: `mysql-deployment.yaml` + `mysql-pvc.yaml` + Service `mysql` (`ClusterIP`).
- **Backend Laravel**: `backend-deployment.yaml` + Service `backend` (`ClusterIP`).
- **Proxy Nginx**: `nginx-config.yaml` + `nginx-deployment.yaml` + Service `api` (`ClusterIP`).
- **Frontend Nuxt**: `frontend-deployment.yaml` + Service `bookkinder-frontend` (`ClusterIP`).
- **Exposición**: `ingress.yaml` enruta `/` al frontend y `/api` al proxy Nginx.

## Interconexión
- El backend se conecta a MySQL mediante el DNS `mysql:3306` usando variables del `ConfigMap` y `Secret`.
- Nginx actúa como proxy para `/api` y reenvía las peticiones al Service `backend:8000`.
- El Ingress entrega `/` al frontend (`bookkinder-frontend:3000`) y `/api` al proxy (`api:80`).

## Requisitos previos
- Minikube iniciado (`minikube start`).
- `kubectl` instalado y apuntando al cluster de Minikube.
- Docker local con acceso a los proyectos `bookkinder-backend` y `bookkinder-frontend`.

## Preparar imágenes locales
1. **Construir imágenes**
   ```bash
   docker build -t bookkinder-backend:latest -f ../bookkinder-backend/docker/Dockerfile ../bookkinder-backend
   docker build -t bookkinder-frontend-frontend:latest -f ../bookkinder-frontend/docker/Dockerfile ../bookkinder-frontend
   ```
2. **Cargar en Minikube** (solo necesario si `imagePullPolicy: Never` o no hay registry accesible):
   ```bash
   minikube image load bookkinder-backend:latest
   minikube image load bookkinder-frontend-frontend:latest
   ```

## Despliegue paso a paso
> Todos los comandos siguientes son obligatorios salvo que se indique lo contrario. Ejecuta cada bloque completo antes de continuar.

### 1. Namespace y configuraciones base
```bash
kubectl apply -f namespace.yaml
kubectl apply -n bookkinder-dev -f secret.yaml
kubectl apply -n bookkinder-dev -f configmap.yaml
```

### 2. Base de datos MySQL
```bash
kubectl apply -n bookkinder-dev -f mysql-pvc.yaml
kubectl apply -n bookkinder-dev -f mysql-deployment.yaml
```

### 3. Backend Laravel
```bash
kubectl apply -n bookkinder-dev -f backend-service.yaml
kubectl apply -n bookkinder-dev -f backend-deployment.yaml
```

### 4. Proxy Nginx para la API
```bash
kubectl apply -n bookkinder-dev -f nginx-config.yaml
kubectl apply -n bookkinder-dev -f nginx-deployment.yaml
```

### 5. Frontend Nuxt
```bash
kubectl apply -n bookkinder-dev -f frontend-deployment.yaml
```

### 6. Ingress (exposición externa)
> Solo es necesario habilitar el addon la primera vez en cada cluster Minikube.
```bash
minikube addons enable ingress
kubectl apply -n bookkinder-dev -f ingress.yaml
```

## Verificación
- Recursos: `kubectl get all -n bookkinder-dev`
- Endpoints para comprobar balanceo: `kubectl get endpoints -n bookkinder-dev backend api mysql`
- Logs del backend y del proxy:
  ```bash
  kubectl logs -n bookkinder-dev deploy/backend
  kubectl logs -n bookkinder-dev deploy/api
  ```

## Acceso a la aplicación
### Mediante Ingress
1. Obtén la IP del cluster: `minikube ip`.
2. Añade `bookkinder.local` a tu archivo `hosts` apuntando a esa IP.
3. Frontend: `http://bookkinder.local/`
4. API: `http://bookkinder.local/api`

### Mediante port-forward (opcional)
- Frontend: `kubectl port-forward -n bookkinder-dev svc/bookkinder-frontend 3000:3000`
- Backend directo: `kubectl port-forward -n bookkinder-dev svc/backend 8000:8000`
- API vía Nginx: `kubectl port-forward -n bookkinder-dev svc/api 8080:80`

## Limpieza (opcional)
```bash
kubectl delete namespace bookkinder-dev
minikube addons disable ingress   # solo si no lo necesitas para otros proyectos
```

## Notas
- El PVC de MySQL (`mysql-pvc.yaml`) reserva 1GiB con `storageClass` estándar.
- Las credenciales de base de datos se encuentran en `secret.yaml` y deben mantenerse sincronizadas con `.env` del backend.
- Si actualizas las imágenes, vuelve a ejecutar `docker build` y `minikube image load` antes de repetir los `kubectl apply`.
