// src/management/UserManagementPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns'; // Para formatear la fecha de nacimiento

// Importar servicios de usuario (se actualizarán a continuación)
import {
  getAllUsers, // Función que obtendrá usuarios con paginación y filtros
  createUser,
  updateUser,
  deleteUser,
  updateUserRole, // Función para cambiar el rol
} from '../services/users.service';

// Definir los roles permitidos (excepto ADMIN para creación/edición)
const USER_ROLES = ['BARBERO', 'TATUADOR', 'CLIENTE'];
const ALL_ROLES = ['ADMIN', ...USER_ROLES]; // Para mostrar en el filtro, incluyendo ADMIN

export const UserManagementPanel: React.FC = () => {
  const { token, user: currentUser } = useAuth(); // Obtener el token y el usuario actual
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any | null>(null); // Usuario que se está editando

  // Estados del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState(''); // Formato YYYY-MM-DD
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'BARBERO' | 'TATUADOR' | 'CLIENTE'>('CLIENTE'); // Rol para creación/edición

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estados para filtro y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>(''); // Rol para filtrar la lista
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Usuarios por página
  const [totalUsers, setTotalUsers] = useState(0);
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  useEffect(() => {
    if (token) {
      fetchUsers(currentPage, usersPerPage, searchTerm, filterRole);
    }
  }, [token, currentPage, usersPerPage, searchTerm, filterRole]); // Dependencias para refetch

  const fetchUsers = async (page: number, limit: number, term: string, roleFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllUsers(token!, {
        page,
        limit,
        searchTerm: term || undefined,
        rol: roleFilter === '' ? undefined : (roleFilter as 'ADMIN' | 'BARBERO' | 'TATUADOR' | 'CLIENTE'),
      });
      setUsers(response.data);
      setTotalUsers(response.meta.total); // Asumiendo que el backend devuelve meta.total
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentUserData(null);
    setFirstName('');
    setLastName('');
    setPhone('');
    setBirthDate('');
    setUsername('');
    setPassword('');
    setSelectedRole('CLIENTE');
    setFormError(null);
    setFormLoading(false);
  };

  const handleEditClick = (user: any) => {
    setIsEditing(true);
    setCurrentUserData(user);
    setFirstName(user.nombre);
    setLastName(user.apellidos);
    setPhone(user.telefono);
    setBirthDate(format(new Date(user.fecha_nacimiento), 'yyyy-MM-dd')); // Formatear para input date
    setUsername(user.username || '');
    // No cargar la contraseña por seguridad
    setPassword('');
    setSelectedRole(user.rol); // El rol ya viene en el objeto de usuario del findOne
    setFormError(null);
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !birthDate.trim()) {
      setFormError('Nombre, apellidos, teléfono y fecha de nacimiento son obligatorios.');
      setFormLoading(false);
      return;
    }
    if (!['CLIENTE', 'BARBERO', 'TATUADOR'].includes(selectedRole)) {
      setFormError('Rol inválido. No se pueden crear o editar usuarios con el rol ADMIN.');
      setFormLoading(false);
      return;
    }
    if (selectedRole !== 'CLIENTE' && (!username.trim() || !password.trim())) {
      setFormError('Username y contraseña son obligatorios para este tipo de usuario.');
      setFormLoading(false);
      return;
    }

    try {
      const userData = {
        nombre: firstName,
        apellidos: lastName,
        telefono: phone,
        fecha_nacimiento: birthDate,
        tipo_perfil: selectedRole,
        username: selectedRole !== 'CLIENTE' ? username : undefined, // Enviar username solo si no es CLIENTE
        password: selectedRole !== 'CLIENTE' ? password : undefined, // Enviar password solo si no es CLIENTE
      };

      if (isEditing && currentUserData) {
        // Excluir password y tipo_perfil si no se van a cambiar por esta ruta
        const updateData: any = { ...userData };
        delete updateData.password; // La contraseña tiene su propia ruta
        delete updateData.tipo_perfil; // El rol tiene su propia ruta
        if (selectedRole === 'CLIENTE') {
          updateData.username = null; // Si se cambia a CLIENTE, username debe ser null
        }

        await updateUser(token!, currentUserData.id, updateData);

        // Si se cambió el rol, también actualizarlo (por separado)
        if (selectedRole !== currentUserData.rol) {
            await updateUserRole(token!, currentUserData.id, selectedRole);
        }

      } else {
        await createUser(token!, userData);
      }
      resetForm();
      setCurrentPage(1); // Volver a la primera página tras crear/editar
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el usuario.');
    } finally {
      setFormLoading(false);
      fetchUsers(currentPage, usersPerPage, searchTerm, filterRole); // Refrescar la lista
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (currentUserData && currentUserData.id === id) {
        setFormError('No puedes eliminarte a ti mismo.');
        return;
    }
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
      setLoading(true);
      setError(null);
      try {
        await deleteUser(token!, id);
        // Si el usuario eliminado era el último en la página y no era la primera, ir a la anterior
        if (users.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else {
            fetchUsers(currentPage, usersPerPage, searchTerm, filterRole); // Refrescar la lista
        }
      } catch (err: any) {
        setError(err.message || 'Error al eliminar el usuario.');
        setLoading(false);
      }
    }
  };

  // Manejadores de Paginación y Filtro
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la página 1 al buscar
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
    setCurrentPage(1); // Resetear a la página 1 al filtrar por rol
  };


  if (!token || currentUser?.rol !== 'ADMIN') { // Solo ADMIN puede acceder
    return <div className="error-message">Acceso denegado. Solo los administradores pueden gestionar usuarios.</div>;
  }

  if (loading) {
    return <div className="loading-spinner">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="management-panel">
      <h3>Gestión de Usuarios</h3>

      {/* Controles de búsqueda y filtro */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="Buscar por nombre, apellidos, teléfono..."
          className="text-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select
          className="select-input"
          value={filterRole}
          onChange={handleRoleFilterChange}
        >
          <option value="">Todos los Roles</option>
          {ALL_ROLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <button className="button-primary btn" onClick={resetForm}>
          <span>{isEditing ? 'Cancelar Edición' : 'Nuevo Usuario'}</span>
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Teléfono</th>
            <th>Fecha Nac.</th>
            <th>Username</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && !loading ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center' }}>No hay usuarios registrados con los filtros aplicados.</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nombre}</td>
                <td>{user.apellidos}</td>
                <td>{user.telefono}</td>
                <td>{format(new Date(user.fecha_nacimiento), 'dd/MM/yyyy')}</td>
                <td>{user.username || '-'}</td>
                <td>{user.rol}</td>
                <td className="table-actions">
                  <button className="action-button" onClick={() => handleEditClick(user)}>
                    ✏️
                  </button>
                  {/* No permitir eliminar al propio usuario logeado */}
                  {currentUser?.id !== user.id && (
                    <button className="action-button delete" onClick={() => handleDeleteUser(user.id)}>
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-button btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || formLoading}
          >
            <span>Anterior</span>
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            className="pagination-button btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || formLoading}
          >
            <span>Siguiente</span>
          </button>
        </div>
      )}

      {/* Formulario de creación/edición */}
      <form onSubmit={handleCreateOrUpdateUser} className="creation-form">
        <h4>{isEditing ? `Editar Usuario: ${currentUserData?.nombre} ${currentUserData?.apellidos}` : 'Crear Nuevo Usuario'}</h4>
        <div className="form-group">
          <label htmlFor="user-firstName">Nombre:</label>
          <input
            type="text"
            id="user-firstName"
            className="text-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={formLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="user-lastName">Apellidos:</label>
          <input
            type="text"
            id="user-lastName"
            className="text-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={formLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="user-phone">Teléfono:</label>
          <input
            type="tel"
            id="user-phone"
            className="text-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={formLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="user-birthDate">Fecha de Nacimiento:</label>
          <input
            type="date"
            id="user-birthDate"
            className="text-input"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={formLoading}
          />
        </div>
        
        {/* Campos de Username y Password solo para roles que no son CLIENTE */}
        {selectedRole !== 'CLIENTE' && (
          <>
            <div className="form-group">
              <label htmlFor="user-username">Username:</label>
              <input
                type="text"
                id="user-username"
                className="text-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isEditing || formLoading} // Username no editable si es edición
              />
            </div>
            {!isEditing && ( // Contraseña solo al crear
              <div className="form-group">
                <label htmlFor="user-password">Contraseña:</label>
                <input
                  type="password"
                  id="user-password"
                  className="text-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={formLoading}
                />
              </div>
            )}
          </>
        )}

        <div className="form-group">
          <label htmlFor="user-role">Rol:</label>
          <select
            id="user-role"
            className="select-input"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as 'BARBERO' | 'TATUADOR' | 'CLIENTE')}
            disabled={formLoading || isEditing && currentUserData?.id === currentUser?.id} // No editar el rol del propio ADMIN
          >
            <option value="">Selecciona un Rol</option>
            {USER_ROLES.map(role => ( // Solo roles no ADMIN
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {formError && <p className="error-message">{formError}</p>}
        <div className="form-buttons-container">
          <button type="submit" className="button-primary btn" disabled={formLoading}>
          <span>{formLoading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};