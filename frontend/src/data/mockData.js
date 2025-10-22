/**
 * Données de test pour le développement
 * 
 * Permet de tester l'application sans Firebase
 */

export const mockDriversData = {
  drivers: [
    {
      id: '1',
      name: 'Jean Tremblay',
      bestTime: 95432, // 1:35.432
      potential: 95124,
      consistency: 450,
      validLaps: 42,
      lastSession: '2025-10-20T14:30:00',
      carClass: 'GT3',
      track: 'Circuit Gilles-Villeneuve',
      segments: {
        S1: 18234,
        S2: 19456,
        S3: 20123,
        S4: 18654,
        S5: 19234,
        S6: 17832
      }
    },
    {
      id: '2',
      name: 'Marie Dubois',
      bestTime: 96123,
      potential: 95887,
      consistency: 520,
      validLaps: 38,
      lastSession: '2025-10-21T10:15:00',
      carClass: 'GT3',
      track: 'Circuit Gilles-Villeneuve',
      segments: {
        S1: 18345,
        S2: 19567,
        S3: 20234,
        S4: 18765,
        S5: 19345,
        S6: 17943
      }
    },
    {
      id: '3',
      name: 'Pierre Gagnon',
      bestTime: 96867,
      potential: 96234,
      consistency: 680,
      validLaps: 35,
      lastSession: '2025-10-22T08:00:00',
      carClass: 'GT4',
      track: 'Circuit Gilles-Villeneuve',
      segments: {
        S1: 18456,
        S2: 19678,
        S3: 20345,
        S4: 18876,
        S5: 19456,
        S6: 18054
      }
    },
    {
      id: '4',
      name: 'Sophie Leblanc',
      bestTime: 97234,
      potential: 96789,
      consistency: 590,
      validLaps: 40,
      lastSession: '2025-10-21T16:45:00',
      carClass: 'GT3',
      track: 'Spa-Francorchamps',
      segments: {
        S1: 18567,
        S2: 19789,
        S3: 20456,
        S4: 18987,
        S5: 19567,
        S6: 18165
      }
    },
    {
      id: '5',
      name: 'Luc Bergeron',
      bestTime: 97789,
      potential: 97234,
      consistency: 720,
      validLaps: 33,
      lastSession: '2025-10-20T12:30:00',
      carClass: 'GT4',
      track: 'Circuit Gilles-Villeneuve',
      segments: {
        S1: 18678,
        S2: 19890,
        S3: 20567,
        S4: 19098,
        S5: 19678,
        S6: 18276
      }
    },
    {
      id: '6',
      name: 'Isabelle Roy',
      bestTime: 98123,
      potential: 97654,
      consistency: 650,
      validLaps: 37,
      lastSession: '2025-10-22T11:20:00',
      carClass: 'GT3',
      track: 'Spa-Francorchamps',
      segments: {
        S1: 18789,
        S2: 19901,
        S3: 20678,
        S4: 19109,
        S5: 19789,
        S6: 18387
      }
    },
    {
      id: '7',
      name: 'Marc Côté',
      bestTime: 98567,
      potential: 98012,
      consistency: 780,
      validLaps: 30,
      lastSession: '2025-10-19T14:00:00',
      carClass: 'GT4',
      track: 'Monza',
      segments: {
        S1: 18890,
        S2: 20012,
        S3: 20789,
        S4: 19210,
        S5: 19890,
        S6: 18498
      }
    },
    {
      id: '8',
      name: 'Julie Martin',
      bestTime: 99012,
      potential: 98456,
      consistency: 690,
      validLaps: 36,
      lastSession: '2025-10-21T09:30:00',
      carClass: 'GT3',
      track: 'Circuit Gilles-Villeneuve',
      segments: {
        S1: 18991,
        S2: 20123,
        S3: 20890,
        S4: 19321,
        S5: 19991,
        S6: 18609
      }
    }
  ]
};

export const mockMetadata = {
  lastUpdate: '2025-10-22 12:30:00',
  sessionCount: 85,
  totalDrivers: 8,
  uploadedAt: '2025-10-22T12:35:00Z'
};

