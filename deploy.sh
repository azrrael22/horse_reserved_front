#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="us-east-1"
AWS_ACCOUNT="950876115395"
ECR_REPO="horse-reserved-front"
IMAGE_URI="${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest"
SERVICE_ARN="arn:aws:apprunner:${AWS_REGION}:${AWS_ACCOUNT}:service/horse-reserved-front/6ec06c2c310742fa8e958dc19794649d"

echo "==> Autenticando Docker en ECR..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin \
    "${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "==> Construyendo imagen Docker (staging, linux/amd64)..."
docker build --platform linux/amd64 -t "${ECR_REPO}:latest" .

echo "==> Subiendo imagen a ECR..."
docker tag "${ECR_REPO}:latest" "$IMAGE_URI"
docker push "$IMAGE_URI"

echo "==> Esperando a que App Runner detecte la nueva imagen..."
# App Runner tiene AutoDeployments activo; dispara deploy al ver el nuevo digest en ECR.
# Si el servicio ya está en OPERATION_IN_PROGRESS se espera; si está RUNNING se fuerza.
STATUS=$(aws apprunner describe-service \
  --service-arn "$SERVICE_ARN" --region "$AWS_REGION" \
  --query 'Service.Status' --output text)

if [ "$STATUS" = "RUNNING" ]; then
  echo "==> Forzando nuevo deploy..."
  aws apprunner start-deployment --service-arn "$SERVICE_ARN" --region "$AWS_REGION" > /dev/null 2>&1 || \
    echo "    (App Runner ya detectó el cambio y arrancó el deploy automáticamente)"
fi

echo "==> Monitoreando despliegue..."
for i in $(seq 1 20); do
  STATUS=$(aws apprunner describe-service \
    --service-arn "$SERVICE_ARN" --region "$AWS_REGION" \
    --query 'Service.Status' --output text)
  echo "    $(date '+%H:%M:%S') — $STATUS"
  [ "$STATUS" = "RUNNING" ] && break
  [ "$STATUS" = "CREATE_FAILED" ] || [ "$STATUS" = "DELETE_FAILED" ] && {
    echo "ERROR: El despliegue falló con estado $STATUS"
    exit 1
  }
  sleep 30
done

SERVICE_URL=$(aws apprunner describe-service \
  --service-arn "$SERVICE_ARN" --region "$AWS_REGION" \
  --query 'Service.ServiceUrl' --output text)

echo ""
echo "Despliegue completado: https://${SERVICE_URL}"
