document.addEventListener('DOMContentLoaded', async function() {
    const SUPABASE_URL = 'https://xgycsakujaopnbkgeuvg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneWNzYWt1amFvcG5ia2dldXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4MTg4ODcsImV4cCI6MjAzNDM5NDg4N30.TkdIIO1_nD1XiH133jev1B4It2bcIRjIZRhgudQPBTw';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    async function loadTournamentData() {
        const urlParams = new URLSearchParams(window.location.search);
        const tournamentId = urlParams.get('id');

        try {
            const { data, error } = await supabaseClient
                .from('tournaments')
                .select('*')
                .eq('id', tournamentId)
                .single();

            if (error) throw error;

            document.getElementById('tournamentName').textContent = data.tournament_name;
            document.getElementById('adminName').textContent = data.admin_name;

            const participants = JSON.parse(data.participants);
            generateMatches(participants);
        } catch (error) {
            console.error("Erro ao carregar dados do torneio:", error);
        }
    }

    function generateMatches(participants) {
        const shuffledParticipants = participants.sort(() => 0.5 - Math.random());
        const matchesContainer = document.getElementById('matchesContainer');
        matchesContainer.innerHTML = '';

        for (let i = 0; i < shuffledParticipants.length; i += 2) {
            if (shuffledParticipants[i + 1]) {
                const matchDiv = document.createElement('div');
                matchDiv.textContent = `${shuffledParticipants[i]} vs ${shuffledParticipants[i + 1]}`;
                matchDiv.id = `match-${i / 2}`;

                const resultInput = document.createElement('input');
                resultInput.type = 'number';
                resultInput.max = 4;
                resultInput.min = 0;
                resultInput.placeholder = 'Pinos';
                resultInput.id = `result-${i / 2}`;

                const submitResultButton = document.createElement('button');
                submitResultButton.textContent = 'Registrar Resultado';
                submitResultButton.addEventListener('click', () => registerResult(i / 2, shuffledParticipants[i], shuffledParticipants[i + 1]));

                matchDiv.appendChild(resultInput);
                matchDiv.appendChild(submitResultButton);
                matchesContainer.appendChild(matchDiv);
            }
        }
    }

    function registerResult(matchId, participant1, participant2) {
        const resultInput = document.getElementById(`result-${matchId}`);
        const pinos = parseInt(resultInput.value);

        if (isNaN(pinos) || pinos < 0 || pinos > 4) {
            alert('Número de pinos inválido. Deve estar entre 0 e 4.');
            return;
        }

        const resultsContainer = document.getElementById('resultsContainer');
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `${participant1} vs ${participant2}: ${pinos} pinos`;
        resultsContainer.appendChild(resultDiv);

        updateRanking(participant1, pinos);
    }

    const ranking = {};

    function updateRanking(participant, points) {
        if (!ranking[participant]) {
            ranking[participant] = 0;
        }
        ranking[participant] += points;
        renderRanking();
    }

    function renderRanking() {
        const rankingBody = document.getElementById('rankingBody');
        rankingBody.innerHTML = '';

        const sortedRanking = Object.keys(ranking).sort((a, b) => ranking[b] - ranking[a]);
        sortedRanking.forEach(participant => {
            const row = document.createElement('tr');
            const participantCell = document.createElement('td');
            const pointsCell = document.createElement('td');

            participantCell.textContent = participant;
            pointsCell.textContent = ranking[participant];

            row.appendChild(participantCell);
            row.appendChild(pointsCell);
            rankingBody.appendChild(row);
        });

        if (sortedRanking.length >= 4) {
            generateSemifinals(sortedRanking.slice(0, 4));
        }
    }

    function generateSemifinals(topParticipants) {
        const semifinalsContainer = document.getElementById('semifinalsContainer');
        semifinalsContainer.innerHTML = '';

        const match1 = `${topParticipants[0]} vs ${topParticipants[3]}`;
        const match2 = `${topParticipants[1]} vs ${topParticipants[2]}`;

        const match1Div = document.createElement('div');
        match1Div.textContent = match1;

        const match2Div = document.createElement('div');
        match2Div.textContent = match2;

        const resultInput1 = document.createElement('input');
        resultInput1.type = 'number';
        resultInput1.max = 4;
        resultInput1.min = 0;
        resultInput1.placeholder = 'Pinos';
        resultInput1.id = 'semifinal1';

        const resultInput2 = document.createElement('input');
        resultInput2.type = 'number';
        resultInput2.max = 4;
        resultInput2.min = 0;
        resultInput2.placeholder = 'Pinos';
        resultInput2.id = 'semifinal2';

        const submitSemifinalButton1 = document.createElement('button');
        submitSemifinalButton1.textContent = 'Registrar Resultado';
        submitSemifinalButton1.addEventListener('click', () => registerSemifinalResult(1, topParticipants[0], topParticipants[3]));

        const submitSemifinalButton2 = document.createElement('button');
        submitSemifinalButton2.textContent = 'Registrar Resultado';
        submitSemifinalButton2.addEventListener('click', () => registerSemifinalResult(2, topParticipants[1], topParticipants[2]));

        match1Div.appendChild(resultInput1);
        match1Div.appendChild(submitSemifinalButton1);
        match2Div.appendChild(resultInput2);
        match2Div.appendChild(submitSemifinalButton2);

        semifinalsContainer.appendChild(match1Div);
        semifinalsContainer.appendChild(match2Div);
    }

    function registerSemifinalResult(matchId, participant1, participant2) {
        const resultInput = document.getElementById(`semifinal${matchId}`);
        const pinos = parseInt(resultInput.value);

        if (isNaN(pinos) || pinos < 0 || pinos > 4) {
            alert('Número de pinos inválido. Deve estar entre 0 e 4.');
            return;
        }

        const resultsContainer = document.getElementById('resultsContainer');
        const resultDiv = document.createElement('div');
        resultDiv.textContent = `Semifinal ${matchId}: ${participant1} vs ${participant2}: ${pinos} pinos`;
        resultsContainer.appendChild(resultDiv);

        updateRanking(participant1, pinos);
    }

    await loadTournamentData();
});
