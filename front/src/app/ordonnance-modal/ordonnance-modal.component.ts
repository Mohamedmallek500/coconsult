import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ordonnance } from 'src/models/Ordonnance.model';
import { Medicament } from 'src/models/Medicament.model';
import { OrdonnanceService } from 'src/services/OrdonnanceService.service';
import { UserService } from 'src/services/UserService.service';
import { MedicamentService } from 'src/services/MedicamentService.service';

@Component({
  selector: 'app-ordonnance-modal',
  templateUrl: './ordonnance-modal.component.html',
  styleUrls: ['./ordonnance-modal.component.css']
})
export class OrdonnanceModalComponent implements OnInit {
  ordonnance: Ordonnance | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { ordonnanceId: number | null },
    private dialogRef: MatDialogRef<OrdonnanceModalComponent>,
    private ordonnanceService: OrdonnanceService,
    private userService: UserService,
    private medicamentService: MedicamentService
  ) {}

  ngOnInit(): void {
    this.loadOrdonnance();
  }

  loadOrdonnance(): void {
    if (!this.data.ordonnanceId) {
      this.error = 'Aucune ordonnance associée à ce rendez-vous';
      return;
    }

    this.loading = true;
    this.error = null;

    this.ordonnanceService.getOrdonnanceById(this.data.ordonnanceId).subscribe({
      next: (ordonnanceResponse) => {
        console.log('Ordonnance response:', ordonnanceResponse);
        
        const patientRequest = ordonnanceResponse.patientId
          ? this.userService.getUserById(ordonnanceResponse.patientId).pipe(
              catchError(() => of(null))
            )
          : of(null);

        const doctorRequest = ordonnanceResponse.doctorId
          ? this.userService.getUserById(ordonnanceResponse.doctorId).pipe(
              catchError(() => of(null))
            )
          : of(null);

        const medicamentRequests = ordonnanceResponse.medicamentIds?.length
          ? ordonnanceResponse.medicamentIds.map(id => 
              this.medicamentService.getMedicamentById(id).pipe(
                catchError(() => of(null))
              )
            )
          : [];

        forkJoin({
          patient: patientRequest,
          doctor: doctorRequest,
          medicaments: medicamentRequests.length > 0 ? forkJoin(medicamentRequests) : of([])
        }).subscribe({
          next: ({ patient, doctor, medicaments }) => {
            const validMedicaments = medicaments.filter(med => med !== null) as Medicament[];
            
            this.ordonnance = {
              id: ordonnanceResponse.id,
              patientId: ordonnanceResponse.patientId,
              doctorId: ordonnanceResponse.doctorId,
              patient: patient || undefined,
              doctor: doctor || undefined,
              medicaments: validMedicaments
            };
            
            console.log('Final ordonnance:', this.ordonnance);
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading ordonnance details:', err);
            this.error = err.message || 'Erreur lors de la récupération des informations';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching ordonnance:', err);
        this.error = err.message || 'Échec de la récupération de l\'ordonnance';
        this.loading = false;
      }
    });
  }

  printOrdonnance(): void {
    if (!this.ordonnance) return;

    const printContent = this.generatePrintableHTML();
    const printWindow = window.open('', '_blank', 'width=210mm,height=297mm');
    
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Attendre le chargement du contenu
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Fermer la fenêtre après impression
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 500);
      };
    } else {
      alert('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les pop-ups.');
    }
  }

  private generatePrintableHTML(): string {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const patientAge = this.calculateAge(this.ordonnance?.patient?.dateNaissance);

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ordonnance Médicale - ${this.ordonnance?.patient?.nom} ${this.ordonnance?.patient?.prenom}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
          }
          
          .prescription-container {
            max-width: 190mm;
            margin: 0 auto;
            padding: 10px;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px double #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          
          .doctor-title {
            font-size: 20px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 3px;
          }
          
          .doctor-speciality {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
            font-style: italic;
          }
          
          .doctor-info {
            font-size: 10px;
            color: #444;
            line-height: 1.2;
          }
          
          .prescription-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            color:: #2c5aa0;
            margin: 15px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            border: 1px solid #2c5aa0;
            padding: 10px;
            background: #f8f9fa;
          }
          
          .patient-section {
            background: #f8f9fa;
            padding: 15px;
            border-left: 3px solid #2c5aa0;
            margin-bottom: 15px;
          }
          
          .patient-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          
          .patient-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px 20px;
          }
          
          .patient-info-item {
            display: flex;
            margin-bottom: 5px;
          }
          
          .label {
            font-weight: bold;
            min-width: 100px;
            color: #333;
          }
          
          .value {
            color: #000;
          }
          
          .medications-section {
            margin: 20px 0;
          }
          
          .medications-header {
            background: #2c5aa0;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .medications-list {
            border: 1px solid #2c5aa0;
            background: white;
          }
          
          .medication-item {
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            align-items: flex-start;
            gap: 10px;
          }
          
          .medication-item:last-child {
            border-bottom: none;
          }
          
          .medication-number {
            background: #2c5aa0;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            flex-shrink: 0;
          }
          
          .medication-content {
            flex: 1;
          }
          
          .medication-name {
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          
          .medication-posology {
            color: #333;
            font-style: italic;
            line-height: 1.3;
            margin-left: 15px;
          }
          
          .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            page-break-inside: avoid;
          }
          
          .date-section {
            flex: 1;
          }
          
          .date-label {
            font-weight: bold;
            color: #333;
          }
          
          .date-value {
            color: #666;
            font-size: 11px;
          }
          
          .signature-section {
            text-align: center;
            flex: 1;
          }
          
          .signature-box {
            border: 1px solid #2c5aa0;
            height: 60px;
            width: 180px;
            margin: 10px auto;
            position: relative;
            background: #f8f9fa;
          }
          
          .signature-label {
            color: #666;
            font-size: 10px;
            margin-top: 5px;
            font-style: italic;
          }
          
          .prescription-number {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #2c5aa0;
            color: white;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
          }
          
          .no-medications {
            text-align: center;
            padding: 20px;
            color: #666;
            font-style: italic;
            background: #f8f9fa;
            border: 1px dashed #ccc;
          }
          
          .prescription-footer-note {
            text-align: center;
            margin-top: 15px;
            font-size: 10px;
            color: #888;
            font-style: italic;
          }
          
          @media print {
            body {
              font-size: 10px;
            }
            
            .prescription-container {
              padding: 0;
            }
            
            .footer-section, .medications-section, .patient-section, .header {
              page-break-inside: avoid;
            }
            
            .prescription-number {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="prescription-container">
          <div class="prescription-number">N° ${this.ordonnance?.id || 'XXX'}</div>
          
          <div class="header">
            <div class="doctor-title">
              Dr. ${this.ordonnance?.doctor?.nom || ''} ${this.ordonnance?.doctor?.prenom || ''}
            </div>
            <div class="doctor-speciality">
              ${this.ordonnance?.doctor?.speciality || 'Médecine Générale'}
            </div>
            <div class="doctor-info">
              ${this.ordonnance?.doctor?.adresse || ''}<br>
              Tél: ${this.ordonnance?.doctor?.numtel || 'N/A'} | 
              Email: ${this.ordonnance?.doctor?.email || 'N/A'}
            </div>
          </div>
          
          <div class="prescription-title">
            Ordonnance Médicale
          </div>
          
          <div class="patient-section">
            <div class="patient-title">👤 Informations Patient</div>
            <div class="patient-info-grid">
              <div class="patient-info-item">
                <span class="label">Nom & Prénom :</span>
                <span class="value">${this.ordonnance?.patient?.nom || ''} ${this.ordonnance?.patient?.prenom || ''}</span>
              </div>
              <div class="patient-info-item">
                <span class="label">Date de naissance :</span>
                <span class="value">${this.ordonnance?.patient?.dateNaissance ? new Date(this.ordonnance.patient.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div class="patient-info-item">
                <span class="label">Âge :</span>
                <span class="value">${patientAge || 'N/A'} ans</span>
              </div>
              <div class="patient-info-item">
                <span class="label">CIN :</span>
                <span class="value">${this.ordonnance?.patient?.cin || 'N/A'}</span>
              </div>
              <div class="patient-info-item">
                <span class="label">N° CNSS :</span>
                <span class="value">${this.ordonnance?.patient?.numCnss || 'N/A'}</span>
              </div>
              <div class="patient-info-item">
                <span class="label">Téléphone :</span>
                <span class="value">${this.ordonnance?.patient?.numtel || 'N/A'}</span>
              </div>
            </div>
            <div style="margin-top: 10px;">
              <span class="label">Adresse :</span>
              <span class="value">${this.ordonnance?.patient?.adresse || 'N/A'}</span>
            </div>
          </div>
          
          <div class="medications-section">
            <div class="medications-header">
              💊 PRESCRIPTION MÉDICAMENTEUSE
            </div>
            
            ${this.ordonnance?.medicaments && this.ordonnance.medicaments.length > 0 
              ? `<div class="medications-list">
                  ${this.ordonnance.medicaments.map((medicament, index) => `
                    <div class="medication-item">
                      <div class="medication-number">${index + 1}</div>
                      <div class="medication-content">
                        <div class="medication-name">${medicament.nomMedicament}</div>
                        ${medicament.notes ? `<div class="medication-posology">→ ${medicament.notes}</div>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>`
              : `<div class="no-medications">
                   ⚠️ Aucun médicament prescrit dans cette ordonnance
                 </div>`
            }
          </div>
          
          <div class="footer-section">
            <div class="date-section">
              <div class="date-label">Fait à Sfax, le :</div>
              <div class="date-value">${formattedDate}</div>
            </div>
            
            <div class="signature-section">
              <div class="signature-box"></div>
              <div class="signature-label">Signature et cachet du médecin</div>
            </div>
          </div>
          
          <div class="prescription-footer-note">
            Cette ordonnance a été générée électroniquement et est valide avec la signature du médecin prescripteur.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private calculateAge(dateOfBirth: string | undefined): number | null {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  close(): void {
    this.dialogRef.close();
  }
}