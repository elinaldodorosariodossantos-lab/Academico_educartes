import React, { useState } from 'react';
import { Card, Button, Modal } from '../common';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiArrowUpRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAlunos } from '../../hooks/useAlunos';
import { useTurmas } from '../../hooks/useTurmas';
import type { Turma } from '../../types';
import './Turmas.css';

const DIAS_SEMANA = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

export const Turmas: React.FC = () => {
  const {
    turmas,
    isLoading,
    createTurma,
    updateTurma,
    deleteTurma,
  } = useTurmas();

  const { alunos, isLoading: loadingAlunos, error: alunosError } = useAlunos();
  const [pesquisa, setPesquisa] = useState('');
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [pesquisaAluno, setPesquisaAluno] = useState('');
  const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
  const turmasFiltradas = turmas.filter(turma => normalizar(turma.nome).includes(normalizar(pesquisa)));
  const alunosDaTurma = (turma: Turma) => alunos
    .filter(aluno => aluno.turma === turma.id || aluno.turma === turma.nome)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingTurma, setEditingTurma] =
    useState<Turma | null>(null);

  const [formData, setFormData] = useState<
    Partial<Turma>
  >({
    nome: '',
    professor: '',
    horario: '',
    horaInicio: '',
    horaFim: '',
    diasSemana: [],
    quantidadeAlunos: 0,
    sala: '',
  });

  const handleOpenModal = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);

      setFormData({
        ...turma,
        horaInicio: turma.horaInicio || '',
        horaFim: turma.horaFim || '',
      });
    } else {
      setEditingTurma(null);

      setFormData({
        nome: '',
        professor: '',
        horario: '',
        horaInicio: '',
        horaFim: '',
        diasSemana: [],
        quantidadeAlunos: 0,
        sala: '',
      });
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTurma(null);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const horarioCompleto = `${formData.horaInicio} - ${formData.horaFim}`;

      const dadosTurma = {
        ...formData,
        horario: horarioCompleto,
      };

      if (editingTurma) {
        await updateTurma(
          editingTurma.id,
          dadosTurma
        );
      } else {
        await createTurma(
          dadosTurma as Omit<Turma, 'id'>
        );
      }

      handleCloseModal();
    } catch (error) {
      console.error(
        'Erro ao salvar turma:',
        error
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        'Tem certeza que deseja deletar esta turma?'
      )
    ) {
      try {
        await deleteTurma(id);
      } catch (error) {
        console.error(
          'Erro ao deletar turma:',
          error
        );
      }
    }
  };

  const toggleDia = (dia: string) => {
    setFormData({
      ...formData,
      diasSemana: formData.diasSemana?.includes(dia)
        ? formData.diasSemana.filter(
            (d) => d !== dia
          )
        : [
            ...(formData.diasSemana || []),
            dia,
          ],
    });
  };

  return (
    <div className="turmas-container">
      <div className="turmas-header">
        <div>
          <h1>Turmas</h1>
          <p>
            Gerenciar cadastro de turmas
          </p>
        </div>

        <Button
          icon={<FiPlus size={20} />}
          onClick={() => handleOpenModal()}
        >
          Nova Turma
        </Button>
      </div>

      <label className="turmas-search">
        <FiSearch size={20} aria-hidden="true" />
        <input type="search" aria-label="Pesquisar turma" placeholder="Pesquisar turma pelo nome..."
          value={pesquisa} onChange={event => setPesquisa(event.target.value)} />
      </label>
      {alunosError && <p role="alert">Não foi possível carregar os alunos: {alunosError}</p>}
      <div className="turmas-grid">
        {isLoading ? (
          <p className="text-muted">
            Carregando turmas...
          </p>
        ) : turmasFiltradas.length === 0 ? (
          <p className="text-muted">
            {pesquisa ? 'Nenhuma turma encontrada para esta pesquisa.' : 'Nenhuma turma cadastrada'}
          </p>
        ) : (
          turmasFiltradas.map((turma) => (
            <Card
              key={turma.id}
              hoverable
              padding="lg"
              className="turma-card"
            >
              <button type="button" className="turma-open-button"
                aria-label={`Ver alunos matriculados em ${turma.nome}`}
                onClick={() => { setPesquisaAluno(''); setSelectedTurma(turma); }} />
              <div className="turma-card-header">
                <div>
                  <h3>{turma.nome}</h3>

                  <p className="text-muted">
                    {turma.professor}
                  </p>
                </div>

                <div className="turma-actions">
                  <button
                    className="action-btn"
                    onClick={() =>
                      handleOpenModal(turma)
                    }
                    title="Editar"
                  >
                    <FiEdit2 size={18} />
                  </button>

                  <button
                    className="action-btn delete-btn"
                    onClick={() =>
                      handleDelete(turma.id)
                    }
                    title="Deletar"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>


              <div className="turma-card-body">
                <div className="turma-info">
                  <p className="text-small">
                    <strong>Dias:</strong>{' '}
                    {turma.diasSemana?.join(
                      ', '
                    ) || 'Não definido'}
                  </p>
                  
                  <p>
                    <strong>Horário:</strong>{' '}
                    {turma.horario}
                  </p>

                  <p>
                    <strong>Sala:</strong>{' '}
                    {turma.sala ||
                      'Não definida'}
                  </p>

                  <p>
                    <strong>Alunos:</strong>{' '}
                    {loadingAlunos ? 'Carregando...' : alunosError ? 'Indisponível' : alunosDaTurma(turma).length}
                  </p>
                </div>

              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={Boolean(selectedTurma)} onClose={() => setSelectedTurma(null)}
        title={selectedTurma ? `Alunos — ${selectedTurma.nome}` : 'Alunos matriculados'} size="md">
        {loadingAlunos ? <p>Carregando alunos...</p> : alunosError ? (
          <p role="alert">Não foi possível carregar os alunos. Tente novamente.</p>
        ) : selectedTurma && (
          <>
            <div className="roster-summary">
              <div className="roster-symbol"><FiUsers size={24} aria-hidden="true" /></div>
              <div className="roster-summary-copy">
                <strong>{alunosDaTurma(selectedTurma).length} {alunosDaTurma(selectedTurma).length === 1 ? 'aluno matriculado' : 'alunos matriculados'}</strong>
                <p>{selectedTurma.professor || 'Professor não informado'}{selectedTurma.horario ? ` · ${selectedTurma.horario}` : ''}</p>
              </div>
            </div>
            <label className="turmas-search roster-search">
              <FiSearch size={18} aria-hidden="true" />
              <input type="search" aria-label="Pesquisar aluno nesta turma" placeholder="Buscar aluno pelo nome..."
                value={pesquisaAluno} onChange={event => setPesquisaAluno(event.target.value)} />
            </label>
            {alunosDaTurma(selectedTurma).length === 0 ? <p>Nenhum aluno matriculado nesta turma.</p> : (
              <ul className="roster-list">
                {alunosDaTurma(selectedTurma).filter(aluno => normalizar(aluno.nome).includes(normalizar(pesquisaAluno))).map(aluno => (
                  <li key={aluno.id}>
                    <Link className="roster-student" to={`/alunos/${aluno.id}`}>
                      <span className="roster-avatar" aria-hidden="true">{aluno.nome.trim().split(/\s+/).filter(Boolean).map(parte => parte[0]).filter((_, index, letras) => index === 0 || index === letras.length - 1).join('').toLocaleUpperCase('pt-BR')}</span>
                      <span className="roster-name"><strong>{aluno.nome}</strong><small>Ver cadastro do aluno</small></span>
                      <span className={`roster-status ${aluno.status === 'Ativo' ? 'is-active' : 'is-inactive'}`}>{aluno.status}</span>
                      <FiArrowUpRight className="roster-arrow" size={18} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {pesquisaAluno && alunosDaTurma(selectedTurma).length > 0 && !alunosDaTurma(selectedTurma).some(aluno => normalizar(aluno.nome).includes(normalizar(pesquisaAluno))) && <p className="roster-empty" role="status">Nenhum aluno encontrado para esta pesquisa.</p>}
          </>
        )}
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingTurma
            ? 'Editar Turma'
            : 'Nova Turma'
        }
        size="md"
        footer={
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>

            <Button onClick={handleSubmit}>
              {editingTurma
                ? 'Atualizar'
                : 'Criar'}
            </Button>
          </div>
        }
      >
        <form
          className="turma-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>
              Nome da Turma *
            </label>

            <input
              type="text"
              required
              value={formData.nome || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nome: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Professor *</label>

            <input
              type="text"
              required
              value={
                formData.professor || ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  professor:
                    e.target.value,
                })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Horário de Início *
              </label>

              <input
                type="time"
                required
                value={
                  formData.horaInicio || ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    horaInicio:
                      e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>
                Horário de Término *
              </label>

              <input
                type="time"
                required
                value={
                  formData.horaFim || ''
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    horaFim:
                      e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sala</label>

              <input
                type="text"
                value={formData.sala || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sala: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Dias da Semana
            </label>

            <div className="dias-checkbox">
              {DIAS_SEMANA.map((dia) => (
                <label
                  key={dia}
                  className="checkbox-label"
                >
                  <input
                    type="checkbox"
                    checked={
                      formData.diasSemana?.includes(
                        dia
                      ) || false
                    }
                    onChange={() =>
                      toggleDia(dia)
                    }
                  />

                  <span>{dia}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
