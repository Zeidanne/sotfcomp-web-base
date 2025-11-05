from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def tugas1():
    return render_template('tugas1.html')

@app.route('/tugas2')
def tugas2():
    return render_template('tugas2.html')

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

if __name__ == '__main__':
    app.run(debug=True)