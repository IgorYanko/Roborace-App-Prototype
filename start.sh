#!/bin/bash

# Script para iniciar o Roborace App
# Uso: ./start.sh

echo "🚀 Iniciando Roborace App..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se uma porta está ocupada
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Porta $1 está ocupada${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Porta $1 está livre${NC}"
        return 0
    fi
}

# Função para matar processo em uma porta
kill_port() {
    echo -e "${YELLOW}🔪 Matando processo na porta $1...${NC}"
    lsof -ti tcp:$1 | xargs -I {} kill -9 {} 2>/dev/null
    sleep 1
}

# Verificar e liberar porta 3000 (backend)
if ! check_port 3000; then
    kill_port 3000
    check_port 3000
fi

# Verificar e liberar porta 8080 (frontend)
if ! check_port 8080; then
    kill_port 8080
    check_port 8080
fi

echo ""
echo -e "${GREEN}🎯 Iniciando Backend...${NC}"
cd backend
npm start &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 3

echo -e "${GREEN}🎯 Iniciando Frontend...${NC}"
cd ../frontend
python3 -m http.server 8080 &
FRONTEND_PID=$!

# Aguardar frontend iniciar
sleep 2

echo ""
echo -e "${GREEN}✅ Roborace App iniciado com sucesso!${NC}"
echo ""
echo "🌐 Acesse a aplicação em:"
echo "   Frontend: http://localhost:8080/pages/menu.html"
echo "   Backend:  http://localhost:3000"
echo ""
echo "📊 Status dos serviços:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 Para parar os serviços, pressione Ctrl+C"
echo ""

# Aguardar Ctrl+C
trap 'echo -e "\n${YELLOW}🛑 Parando serviços...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Manter script rodando
wait
