from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

@app.route('/')
def tugas1():
    return render_template('tugas1.html')

@app.route('/tugas2')
def tugas2():
    return render_template('tugas2.html')

@app.route('/tugas3')
def tugas3():
    return render_template('tugas3.html')

@app.route('/hitung-fuzzy', methods=['POST'])
def hitung_fuzzy():
    data = request.json
    permintaan = float(data['permintaan'])
    persediaan = float(data['persediaan'])
    
    # Fungsi keanggotaan Permintaan
    def permintaan_turun(x):
        if x <= 1000:
            return 1
        elif 1000 < x < 5000:
            return (5000 - x) / (5000 - 1000)
        else:
            return 0
    
    def permintaan_naik(x):
        if x <= 1000:
            return 0
        elif 1000 < x < 5000:
            return (x - 1000) / (5000 - 1000)
        else:
            return 1
    
    # Fungsi keanggotaan Persediaan
    def persediaan_sedikit(x):
        if x <= 100:
            return 1
        elif 100 < x < 600:
            return (600 - x) / (600 - 100)
        else:
            return 0
    
    def persediaan_banyak(x):
        if x <= 100:
            return 0
        elif 100 < x < 600:
            return (x - 100) / (600 - 100)
        else:
            return 1
    
    # Hitung derajat keanggotaan
    perm_turun = permintaan_turun(permintaan)
    perm_naik = permintaan_naik(permintaan)
    pers_sedikit = persediaan_sedikit(persediaan)
    pers_banyak = persediaan_banyak(persediaan)
    
    # Rule Sugeno
    rules = []
    alpha_predikat = []
    z_values = []
    
    # Rule 1: Permintaan TURUN AND Persediaan BANYAK => Produksi = Permintaan - Persediaan
    alpha1 = min(perm_turun, pers_banyak)
    z1 = permintaan - persediaan
    if alpha1 > 0:
        rules.append(f"Rule 1: Permintaan TURUN ({perm_turun:.3f}) AND Persediaan BANYAK ({pers_banyak:.3f}) = {alpha1:.3f}")
        alpha_predikat.append(alpha1)
        z_values.append(z1)
    
    # Rule 2: Permintaan TURUN AND Persediaan SEDIKIT => Produksi = Permintaan
    alpha2 = min(perm_turun, pers_sedikit)
    z2 = permintaan
    if alpha2 > 0:
        rules.append(f"Rule 2: Permintaan TURUN ({perm_turun:.3f}) AND Persediaan SEDIKIT ({pers_sedikit:.3f}) = {alpha2:.3f}")
        alpha_predikat.append(alpha2)
        z_values.append(z2)
    
    # Rule 3: Permintaan NAIK AND Persediaan BANYAK => Produksi = Permintaan
    alpha3 = min(perm_naik, pers_banyak)
    z3 = permintaan
    if alpha3 > 0:
        rules.append(f"Rule 3: Permintaan NAIK ({perm_naik:.3f}) AND Persediaan BANYAK ({pers_banyak:.3f}) = {alpha3:.3f}")
        alpha_predikat.append(alpha3)
        z_values.append(z3)
    
    # Rule 4: Permintaan NAIK AND Persediaan SEDIKIT => Produksi = 1.25 * Permintaan - Persediaan
    alpha4 = min(perm_naik, pers_sedikit)
    z4 = 1.25 * permintaan - persediaan
    if alpha4 > 0:
        rules.append(f"Rule 4: Permintaan NAIK ({perm_naik:.3f}) AND Persediaan SEDIKIT ({pers_sedikit:.3f}) = {alpha4:.3f}")
        alpha_predikat.append(alpha4)
        z_values.append(z4)
    
    # Defuzzifikasi (Weighted Average)
    if sum(alpha_predikat) > 0:
        hasil_produksi = sum(a * z for a, z in zip(alpha_predikat, z_values)) / sum(alpha_predikat)
    else:
        hasil_produksi = 0
    
    return jsonify({
        'success': True,
        'permintaan': permintaan,
        'persediaan': persediaan,
        'derajat_keanggotaan': {
            'permintaan_turun': perm_turun,
            'permintaan_naik': perm_naik,
            'persediaan_sedikit': pers_sedikit,
            'persediaan_banyak': pers_banyak
        },
        'rules': rules,
        'alpha_predikat': alpha_predikat,
        'z_values': z_values,
        'hasil_produksi': round(hasil_produksi, 2)
    })

@app.route('/hitung-genetic', methods=['POST'])
def hitung_genetic():
    data = request.json
    items_data = data['items']
    capacity = int(data['capacity'])
    pop_size = int(data.get('pop_size', 8))
    generations = int(data.get('generations', 8))
    crossover_rate = float(data.get('crossover_rate', 0.8))
    mutation_rate = float(data.get('mutation_rate', 0.1))
    
    # Konversi items_data ke format yang sesuai
    items = {}
    for item in items_data:
        items[item['name']] = {
            'weight': int(item['weight']),
            'value': int(item['value'])
        }
    
    item_list = list(items.keys())
    n_items = len(item_list)
    
    # Fungsi decode
    def decode(chromosome):
        total_weight = 0
        total_value = 0
        chosen_items = []
        for gene, name in zip(chromosome, item_list):
            if gene == 1:
                total_weight += items[name]['weight']
                total_value += items[name]['value']
                chosen_items.append(name)
        return chosen_items, total_weight, total_value
    
    # Fungsi fitness
    def fitness(chromosome):
        _, total_weight, total_value = decode(chromosome)
        if total_weight <= capacity:
            return total_value
        else:
            return 0
    
    # Fungsi roulette selection
    def roulette_selection(population, fitnesses):
        total_fit = sum(fitnesses)
        if total_fit == 0:
            return random.choice(population)
        pick = random.uniform(0, total_fit)
        current = 0
        for chrom, fit in zip(population, fitnesses):
            current += fit
            if current >= pick:
                return chrom
        return population[-1]
    
    # Fungsi crossover
    def crossover(p1, p2):
        if len(p1) != len(p2):
            raise ValueError("Parent length mismatch")
        point = random.randint(1, len(p1) - 1)
        child1 = p1[:point] + p2[point:]
        child2 = p2[:point] + p1[point:]
        return child1, child2
    
    # Fungsi mutasi
    def mutate(chromosome, mutation_rate):
        return [1 - g if random.random() < mutation_rate else g for g in chromosome]
    
    # Algoritma Genetika
    population = [[random.randint(0, 1) for _ in range(n_items)] for _ in range(pop_size)]
    generations_data = []
    
    for gen in range(generations):
        fitnesses = [fitness(ch) for ch in population]
        best_index = fitnesses.index(max(fitnesses))
        best_chrom = population[best_index]
        best_fit = fitnesses[best_index]
        best_items, w, v = decode(best_chrom)
        
        generations_data.append({
            'generation': gen + 1,
            'best_chromosome': best_chrom,
            'best_items': best_items,
            'weight': w,
            'value': v,
            'fitness': best_fit
        })
        
        # Buat generasi baru
        new_population = []
        # Elitism
        new_population.append(best_chrom)
        
        # Reproduksi
        while len(new_population) < pop_size:
            parent1 = roulette_selection(population, fitnesses)
            parent2 = roulette_selection(population, fitnesses)
            
            if random.random() < crossover_rate:
                child1, child2 = crossover(parent1, parent2)
            else:
                child1, child2 = parent1[:], parent2[:]
            
            child1 = mutate(child1, mutation_rate)
            child2 = mutate(child2, mutation_rate)
            
            new_population.extend([child1, child2])
        
        population = new_population[:pop_size]
    
    # Hasil akhir
    fitnesses = [fitness(ch) for ch in population]
    best_index = fitnesses.index(max(fitnesses))
    best_chrom = population[best_index]
    best_items, w, v = decode(best_chrom)
    
    return jsonify({
        'success': True,
        'generations': generations_data,
        'final_result': {
            'chromosome': best_chrom,
            'items': best_items,
            'weight': w,
            'value': v,
            'fitness': fitness(best_chrom)
        }
    })

if __name__ == '__main__':
    app.run(debug=True)