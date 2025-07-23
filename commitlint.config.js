module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nova funcionalidade
        'fix', // Correção de bug
        'docs', // Documentação
        'style', // Formatação, ponto e vírgula ausente, etc
        'refactor', // Refatoração de código
        'test', // Adição ou correção de testes
        'chore', // Mudanças no processo de build ou ferramentas auxiliares
        'perf', // Melhoria de performance
        'ci', // Mudanças em arquivos de configuração de CI
        'build', // Mudanças que afetam o sistema de build
        'revert', // Reverte um commit anterior
      ],
    ],
    'subject-case': [2, 'never', ['pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};
