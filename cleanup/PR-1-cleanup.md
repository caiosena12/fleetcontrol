PR 1 — Limpeza de artefatos de build e consolidação de diretórios duplicados

Objetivo
-------
- Remover artefatos de build rastreados (ex.: `.next/`) do repositório.
- Atualizar `.gitignore` para garantir que builds não sejam comitados.
- Propor consolidação ou remoção da pasta duplicada `fleetcontrol/` que contém outro copy do projeto.

O que este PR faz
------------------
1. Cria um branch `chore/cleanup-build-artifacts` (já criado).
2. Remove do controle de versão quaisquer diretórios de build que ainda estejam sendo rastreados (ex.: `.next/`).
3. Garante que `.gitignore` contenha as entradas adequadas (`.next/`, `node_modules/`, etc.).
4. Documenta a recomendação de consolidação da pasta `fleetcontrol/` para revisão humana. Não remove arquivos automaticamente nesta PR.

Próximos passos sugeridos (após aprovação)
-----------------------------------------
- Revisar diferenças entre a raiz e `fleetcontrol/` para identificar arquivos exclusivos.
- Se confirmar duplicação, mover arquivos únicos para a raiz, atualizar imports/paths e remover a pasta duplicada num PR separado.
- Limpar histórico se necessário (opcional, usar com cautela).

Motivação
---------
Build artifacts e pastas duplicadas poluem o histórico e aumentam o tamanho do repo, além de causarem confusão em deploys e CI. Fazer essa limpeza primeiro reduz risco para as refatorações subsequentes.

Notas
-----
- Não excluí nada automaticamente (apenas untrack quando aplicável). A consolidação manual da pasta duplicada requer revisão humana.
