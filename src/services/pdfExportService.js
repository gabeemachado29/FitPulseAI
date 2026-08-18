/**
 * FitPulseAI — PDF & Printable Report Generator
 * Generates clean HTML reports formatted with @media print CSS for easy PDF export.
 */

export function generateReportHTML(profile, weeklyLogs, user) {
  const userName = user?.displayName || user?.email || 'Atleta';
  const reportDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalCals = weeklyLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0);
  const avgCals = Math.round(totalCals / Math.max(1, weeklyLogs.length));
  const totalProtein = weeklyLogs.reduce((sum, log) => sum + (log.totalProtein || 0), 0);
  const avgProtein = Math.round(totalProtein / Math.max(1, weeklyLogs.length));
  const totalCarbs = weeklyLogs.reduce((sum, log) => sum + (log.totalCarbs || 0), 0);
  const avgCarbs = Math.round(totalCarbs / Math.max(1, weeklyLogs.length));
  const totalFat = weeklyLogs.reduce((sum, log) => sum + (log.totalFat || 0), 0);
  const avgFat = Math.round(totalFat / Math.max(1, weeklyLogs.length));

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Relatório Nutricional — ${userName}</title>
      <style>
        body { font-family: sans-serif; color: #111; padding: 30px; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #00E676; padding-bottom: 15px; margin-bottom: 25px; }
        .brand { font-size: 24px; font-weight: bold; color: #0A0E14; }
        .brand span { color: #00C853; }
        .section { margin-bottom: 25px; }
        h2 { font-size: 18px; color: #1A2332; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 10px; }
        .box { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #eee; }
        .box-val { font-size: 20px; font-weight: bold; color: #00C853; }
        .box-lbl { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
        th { background: #f1f3f5; }
        .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">FitPulse<span>AI</span></div>
          <div style="font-size: 14px; color: #555;">Relatório de Acompanhamento Nutricional</div>
        </div>
        <div style="text-align: right; font-size: 13px;">
          <strong>Cliente:</strong> ${userName}<br/>
          <strong>Data:</strong> ${reportDate}
        </div>
      </div>

      <div class="section">
        <h2>1. Perfil & Recomendação Calculada</h2>
        <div class="grid">
          <div class="box"><div class="box-val">${profile?.weight || 0} kg</div><div class="box-lbl">Peso Atual</div></div>
          <div class="box"><div class="box-val">${profile?.height || 0} cm</div><div class="box-lbl">Altura</div></div>
          <div class="box"><div class="box-val">${profile?.bmi || 0}</div><div class="box-lbl">IMC (${profile?.bmiCategory || 'Normal'})</div></div>
          <div class="box"><div class="box-val">${profile?.tdee || 0} kcal</div><div class="box-lbl">Gasto Estimado (TDEE)</div></div>
        </div>
      </div>

      <div class="section">
        <h2>2. Médias Diárias Registradas (Últimos 7 dias)</h2>
        <div class="grid">
          <div class="box"><div class="box-val">${avgCals} kcal</div><div class="box-lbl">Média Calorias / dia</div></div>
          <div class="box"><div class="box-val">${avgProtein}g</div><div class="box-lbl">Média Proteína / dia</div></div>
          <div class="box"><div class="box-val">${avgCarbs}g</div><div class="box-lbl">Média Carboidratos / dia</div></div>
          <div class="box"><div class="box-val">${avgFat}g</div><div class="box-lbl">Média Gordura / dia</div></div>
        </div>
      </div>

      <div class="section">
        <h2>3. Detalhamento Diário</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Calorias</th>
              <th>Proteína</th>
              <th>Carboidratos</th>
              <th>Gordura</th>
              <th>Refeições Registradas</th>
            </tr>
          </thead>
          <tbody>
            ${weeklyLogs.map(log => `
              <tr>
                <td>${log.date}</td>
                <td><strong>${log.totalCalories || 0} kcal</strong></td>
                <td>${log.totalProtein || 0}g</td>
                <td>${log.totalCarbs || 0}g</td>
                <td>${log.totalFat || 0}g</td>
                <td>${log.meals?.length || 0} refeições</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        Gerado automaticamente pelo aplicativo FitPulseAI • Documento para fins de acompanhamento esportivo e nutricional
      </div>
    </body>
    </html>
  `;
}
