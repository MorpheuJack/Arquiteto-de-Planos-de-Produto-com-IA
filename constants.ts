import { PlanStep, PlanSection } from './types';

export const PLAN_STEPS: PlanStep[] = [
  {
    id: 'userIdentification',
    title: 'Identificação do Usuário',
    description: 'Quem é o seu público-alvo? Descreva seus dados demográficos, comportamentos e necessidades. Quais problemas eles enfrentam atualmente?'
  },
  {
    id: 'applicationObjective',
    title: 'Objetivo da Aplicação',
    description: 'Qual é o propósito central da sua aplicação em uma frase simples? Como ela resolve os problemas do usuário?'
  },
  {
    id: 'keyFeatures',
    title: 'Funcionalidades Principais (MVP)',
    description: 'Liste as 3-5 funcionalidades mais importantes para o seu Produto Mínimo Viável. Priorize a usabilidade e o valor imediato.'
  },
  {
    id: 'userJourney',
    title: 'Jornada do Usuário (UX)',
    description: 'Descreva o fluxo ideal do usuário, desde o primeiro acesso até alcançar o resultado desejado. Como você irá reduzir o atrito?'
  },
  {
    id: 'uiDesign',
    title: 'Design da Interface (UI)',
    description: 'Defina o estilo visual: cores, tipografia, layout e princípios de acessibilidade. Como serão as telas principais?'
  },
  {
    id: 'technology',
    title: 'Tecnologia Recomendada',
    description: 'Sugira as melhores linguagens, frameworks e bancos de dados. Será uma aplicação web, mobile ou híbrida?'
  },
  {
    id: 'scalabilitySecurity',
    title: 'Escalabilidade e Segurança',
    description: 'Como o aplicativo suportará o crescimento? Quais medidas de segurança (autenticação, criptografia) serão implementadas?'
  },
  {
    id: 'monetization',
    title: 'Monetização (se aplicável)',
    description: 'Proponha os modelos de receita mais adequados para o seu perfil de usuário (ex: assinatura, freemium, anúncios).'
  },
  {
    id: 'successMetrics',
    title: 'Métricas de Sucesso',
    description: 'Defina os principais indicadores de desempenho (KPIs) para medir o sucesso, como retenção, engajamento e conversão.'
  },
  {
    id: 'competitiveAdvantage',
    title: 'Vantagem Competitiva',
    description: 'O que torna sua aplicação única e difícil de copiar?'
  },
  {
    id: 'actionItems',
    title: 'Próximos Passos',
    description: 'Com base em todo o plano, gere uma lista de próximos passos acionáveis. Você pode adicionar notas para guiar a IA.'
  }
];

export const FREE_STEPS: PlanSection[] = ['userIdentification', 'applicationObjective'];
