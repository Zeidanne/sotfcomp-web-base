from flask import Flask, render_template, request, jsonify
import random
import numpy as np
import pandas as pd
import os

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

@app.route('/tugas4')
def tugas4():
    return render_template('tugas4.html')

@app.route('/hitung-fuzzy', methods=['POST'])
def hitung_fuzzy():
    data = request.json
    permintaan = float(data['permintaan'])
    persediaan = float(data['persediaan'])
    
    # Get selected rules from frontend (defaults to all if not provided)
    selected_rules = data.get('selected_rules', [1, 2, 3, 4])
    
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
    
    # Rule Sugeno (only process selected rules)
    rules = []
    alpha_predikat = []
    z_values = []
    
    # Rule 1: Permintaan TURUN AND Persediaan BANYAK => Produksi = Permintaan - Persediaan
    if 1 in selected_rules:
        alpha1 = min(perm_turun, pers_banyak)
        z1 = permintaan - persediaan
        if alpha1 > 0:
            rules.append(f"Rule 1: Permintaan TURUN ({perm_turun:.3f}) AND Persediaan BANYAK ({pers_banyak:.3f}) = α={alpha1:.3f}")
            alpha_predikat.append(alpha1)
            z_values.append(z1)
    
    # Rule 2: Permintaan TURUN AND Persediaan SEDIKIT => Produksi = Permintaan
    if 2 in selected_rules:
        alpha2 = min(perm_turun, pers_sedikit)
        z2 = permintaan
        if alpha2 > 0:
            rules.append(f"Rule 2: Permintaan TURUN ({perm_turun:.3f}) AND Persediaan SEDIKIT ({pers_sedikit:.3f}) = α={alpha2:.3f}")
            alpha_predikat.append(alpha2)
            z_values.append(z2)
    
    # Rule 3: Permintaan NAIK AND Persediaan BANYAK => Produksi = Permintaan
    if 3 in selected_rules:
        alpha3 = min(perm_naik, pers_banyak)
        z3 = permintaan
        if alpha3 > 0:
            rules.append(f"Rule 3: Permintaan NAIK ({perm_naik:.3f}) AND Persediaan BANYAK ({pers_banyak:.3f}) = α={alpha3:.3f}")
            alpha_predikat.append(alpha3)
            z_values.append(z3)
    
    # Rule 4: Permintaan NAIK AND Persediaan SEDIKIT => Produksi = 1.25 * Permintaan - Persediaan
    if 4 in selected_rules:
        alpha4 = min(perm_naik, pers_sedikit)
        z4 = 1.25 * permintaan - persediaan
        if alpha4 > 0:
            rules.append(f"Rule 4: Permintaan NAIK ({perm_naik:.3f}) AND Persediaan SEDIKIT ({pers_sedikit:.3f}) = α={alpha4:.3f}")
            alpha_predikat.append(alpha4)
            z_values.append(z4)
    
    # Defuzzifikasi (Weighted Average)
    sum_alpha = sum(alpha_predikat)
    sum_alpha_z = sum(a * z for a, z in zip(alpha_predikat, z_values))
    
    if sum_alpha > 0:
        hasil_produksi = sum_alpha_z / sum_alpha
    else:
        hasil_produksi = 0
    
    return jsonify({
        'success': True,
        'permintaan': permintaan,
        'persediaan': persediaan,
        'selected_rules': selected_rules,
        'derajat_keanggotaan': {
            'permintaan_turun': perm_turun,
            'permintaan_naik': perm_naik,
            'persediaan_sedikit': pers_sedikit,
            'persediaan_banyak': pers_banyak
        },
        'rules': rules,
        'alpha_predikat': alpha_predikat,
        'z_values': z_values,
        'sum_alpha_z': sum_alpha_z,
        'sum_alpha': sum_alpha,
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

@app.route('/hitung-tsp', methods=['POST'])
def hitung_tsp():
    data = request.json
    
    # Get parameters
    pop_size = int(data.get('pop_size', 50))
    generations = int(data.get('generations', 100))
    tournament_k = int(data.get('tournament_k', 5))
    pc = float(data.get('crossover_rate', 0.8))
    pm = float(data.get('mutation_rate', 0.2))
    elite_size = int(data.get('elite_size', 1))
    
    # Load distance matrix from Excel file
    try:
        excel_path = os.path.join('assets', '3.b. TSP - AG.xlsx')
        df = pd.read_excel(excel_path, index_col=0)
        cities = list(df.index)
        dist_matrix = df.values.astype(float)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Error loading data: {str(e)}'})
    
    # Helper functions
    def route_distance(route):
        d = sum(dist_matrix[route[i], route[(i+1)%len(route)]] for i in range(len(route)))
        return d
    
    def create_individual(n):
        ind = list(range(n))
        random.shuffle(ind)
        return ind
    
    def initial_population(size, n):
        return [create_individual(n) for _ in range(size)]
    
    def tournament_selection(pop):
        k = random.sample(pop, tournament_k)
        return min(k, key=lambda ind: route_distance(ind))
    
    def ordered_crossover(p1, p2):
        a, b = sorted(random.sample(range(len(p1)), 2))
        child = [-1]*len(p1)
        child[a:b+1] = p1[a:b+1]
        
        p2_idx = 0
        for i in range(len(p1)):
            if child[i] == -1:
                while p2[p2_idx] in child:
                    p2_idx += 1
                child[i] = p2[p2_idx]
        
        return child
    
    def swap_mutation(ind):
        a, b = random.sample(range(len(ind)), 2)
        ind[a], ind[b] = ind[b], ind[a]
    
    # Main GA Loop
    pop = initial_population(pop_size, len(cities))
    best = min(pop, key=lambda ind: route_distance(ind))
    best_dist = route_distance(best)
    
    history = []
    generation_data = []
    
    for g in range(generations):
        new_pop = []
        
        pop = sorted(pop, key=lambda ind: route_distance(ind))
        
        if route_distance(pop[0]) < best_dist:
            best = pop[0]
            best_dist = route_distance(best)
        
        new_pop.extend(pop[:elite_size])
        
        while len(new_pop) < pop_size:
            p1 = tournament_selection(pop)
            p2 = tournament_selection(pop)
            
            child = ordered_crossover(p1, p2) if random.random() < pc else p1[:]
            
            if random.random() < pm:
                swap_mutation(child)
            
            new_pop.append(child)
        
        pop = new_pop
        history.append(best_dist)
        
        # Store every 10th generation or first/last
        if g % 10 == 0 or g == generations - 1:
            generation_data.append({
                'generation': g,
                'best_distance': round(best_dist, 2),
                'best_route': [cities[i] for i in best]
            })
    
    # Final result
    best_route = [cities[i] for i in best]
    
    return jsonify({
        'success': True,
        'cities': cities,
        'generations': generation_data,
        'final_result': {
            'route': best_route,
            'distance': round(best_dist, 2),
            'full_route': best_route + [best_route[0]]
        },
        'history': history
    })

if __name__ == '__main__':
    app.run(debug=True)