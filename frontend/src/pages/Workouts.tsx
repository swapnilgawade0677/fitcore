import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchWorkouts, createWorkout, updateWorkout, deleteWorkout } from '../store/workoutsSlice';
import { fetchMembers } from '../store/membersSlice';
import { fetchTrainers } from '../store/trainersSlice';
import toast from 'react-hot-toast';
import { Plus, Search, Loader2, Edit, Trash2, Activity, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate, cn } from '../utils/helpers';

export default function Workouts() {
  const dispatch = useAppDispatch();
  const { items: workouts, isLoading } = useAppSelector((state) => state.workouts);
  const { items: members } = useAppSelector((state) => state.members);
  const { items: trainers } = useAppSelector((state) => state.trainers);
  const { user } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ member_id: '', trainer_id: '', name: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '', is_active: true, exercises: [] as any[] });
  const [exerciseForm, setExerciseForm] = useState({ name: '', description: '', sets: 3, reps: 10, weight: '', rest_seconds: 60 });

  useEffect(() => { dispatch(fetchWorkouts({ active_only: true })); dispatch(fetchMembers({ limit: 1000 })); dispatch(fetchTrainers());   }, [dispatch]);

  const filteredWorkouts = workouts.filter(w => {
    const member = members.find(m => m.id === w.member_id);
    return member?.user.full_name.toLowerCase().includes(search.toLowerCase()) || w.name.toLowerCase().includes(search.toLowerCase());
  });

  const addExercise = () => {
    if (!exerciseForm.name.trim()) return;
    setFormData(prev => ({ ...prev, exercises: [...prev.exercises, { ...exerciseForm, weight: exerciseForm.weight ? parseFloat(exerciseForm.weight) : null, order: prev.exercises.length }] }));
    setExerciseForm({ name: '', description: '', sets: 3, reps: 10, weight: '', rest_seconds: 60 });
  };

  const removeExercise = (index: number) => setFormData(prev => ({ ...prev, exercises: prev.exercises.filter((_, i) => i !== index).map((e, i) => ({ ...e, order: i })) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, member_id: parseInt(formData.member_id), trainer_id: formData.trainer_id ? parseInt(formData.trainer_id) : undefined, exercises: formData.exercises.map(e => ({ ...e, weight: e.weight ? parseFloat(e.weight) : null })) };
      if (editingWorkout) { await dispatch(updateWorkout({ id: editingWorkout.id, data })).unwrap(); toast.success('Workout updated'); }
      else { await dispatch(createWorkout(data)).unwrap(); toast.success('Workout created'); }
      setShowModal(false); resetForm();
    } catch (error: any) { toast.error(error || 'Operation failed'); }
  };

  const handleEdit = (workout: any) => { setEditingWorkout(workout); setFormData({ member_id: workout.member_id.toString(), trainer_id: workout.trainer_id?.toString() || '', name: workout.name, description: workout.description || '', start_date: workout.start_date, end_date: workout.end_date || '', is_active: workout.is_active, exercises: workout.exercises.map((e: any) => ({ name: e.name, description: e.description || '', sets: e.sets, reps: e.reps, weight: e.weight?.toString() || '', rest_seconds: e.rest_seconds })) }); setShowModal(true); };
  const handleDelete = async (id: number) => { if (confirm('Delete this workout plan?')) { try { await dispatch(deleteWorkout(id)).unwrap(); toast.success('Workout deleted'); } catch (e: any) { toast.error(e); } } };
  const resetForm = () => { setEditingWorkout(null); setFormData({ member_id: '', trainer_id: '', name: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '', is_active: true, exercises: [] }); setExerciseForm({ name: '', description: '', sets: 3, reps: 10, weight: '', rest_seconds: 60 }); };
  const openModal = () => { resetForm(); setShowModal(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-dark-900">Workout Plans</h1><p className="text-dark-500 mt-1">Create and manage member workout plans</p></div>
        {user?.role !== 'member' && <button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Create Workout</button>}
      </div>

      <div className="card p-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400"/><input type="text" placeholder="Search workouts..." value={search} onChange={e=>setSearch(e.target.value)} className="input pl-10"/></div></div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6">{Array.from({length:5}).map((_,i)=><div key={i} className="animate-pulse p-4 border-b border-dark-200"/>)}</div>
        ) : (
          <>
            <div className="divide-y divide-dark-200">
              {filteredWorkouts.map((workout) => {
                const member = members.find(m => m.id === workout.member_id);
                const trainer = trainers.find(t => t.id === workout.trainer_id);
                const isExpanded = expandedId === workout.id;
                return (
                  <div key={workout.id} className="workout-row p-4 hover:bg-dark-50">
                    <div className="flex items-center justify-between" onClick={() => setExpandedId(isExpanded ? null : workout.id)}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"><Activity className="w-6 h-6 text-purple-600"/></div>
                        <div><h3 className="font-medium text-dark-900">{workout.name}</h3><p className="text-sm text-dark-500">{member?.user.full_name} • {workout.exercises.length} exercises</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn('badge', workout.is_active ? 'badge-success' : 'badge-danger')}>{workout.is_active ? 'Active' : 'Inactive'}</span>
                        <span className="text-sm text-dark-500">{formatDate(workout.start_date)} - {workout.end_date || 'Ongoing'}</span>
                        {trainer && <span className="text-sm text-dark-500 flex items-center gap-1"><Dumbbell className="w-3 h-3"/>{trainer.user.full_name}</span>}
                        <div className="flex items-center gap-2">
                          {user?.role !== 'member' && <>
                            <button onClick={(e)=>{e.stopPropagation();handleEdit(workout)}} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><Edit className="w-4 h-4"/></button>
                            <button onClick={(e)=>{e.stopPropagation();handleDelete(workout.id)}} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></button>
                          </>}
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-dark-400"/> : <ChevronDown className="w-5 h-5 text-dark-400"/>}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 ml-16 border-l-2 border-dark-200 pl-4 space-y-3 animate-slide-down">
                        {workout.exercises.map((ex: any, i: number) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-dark-50 rounded-lg">
                            <div className="flex-1"><p className="font-medium text-dark-900">{ex.name}</p>{ex.description && <p className="text-sm text-dark-500">{ex.description}</p>}</div>
                            <div className="flex flex-wrap gap-4 text-sm text-dark-600">
                              <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3"/>{ex.sets} sets × {ex.reps} reps</span>
                              {ex.weight && <span>{ex.weight} lbs</span>}
                              <span>Rest: {ex.rest_seconds}s</span>
                            </div>
                          </div>
                        ))}
                        {workout.description && <p className="text-sm text-dark-500 italic">{workout.description}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredWorkouts.length === 0 && <div className="text-center py-12 text-dark-500">No workout plans found</div>}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-dark-100 rounded-2xl shadow-xl border border-dark-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex justify-between items-center"><h2 className="text-xl font-semibold">{editingWorkout?'Edit':'Create'} Workout Plan</h2><button onClick={()=>setShowModal(false)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-200"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Member</label><select value={formData.member_id} onChange={e=>setFormData({...formData,member_id:e.target.value})} className="input" required><option value="">Select Member</option>{members.map(m=><option key={m.id} value={m.id}>{m.user.full_name}</option>)}</select></div><div><label className="label">Trainer</label><select value={formData.trainer_id} onChange={e=>setFormData({...formData,trainer_id:e.target.value})} className="input"><option value="">Select Trainer</option>{trainers.filter(t=>t.is_active).map(t=><option key={t.id} value={t.id}>{t.user.full_name}</option>)}</select></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">Plan Name</label><input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="input" required/></div><div><label className="label">Start Date</label><input type="date" value={formData.start_date} onChange={e=>setFormData({...formData,start_date:e.target.value})} className="input" required/></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="label">End Date (Optional)</label><input type="date" value={formData.end_date} onChange={e=>setFormData({...formData,end_date:e.target.value})} className="input"/></div><div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={e=>setFormData({...formData,is_active:e.target.checked})} className="w-4 h-4 rounded border-dark-300 text-primary-600"/><span className="text-sm text-dark-600">Active</span></label></div></div>
              <div><label className="label">Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} className="input" rows={2}/></div>

              <div><h4 className="font-medium text-dark-900 mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-600"/>Exercises</h4>
                <div className="space-y-3">
                  {formData.exercises.map((ex, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 bg-dark-50 rounded-lg">
                      <input type="text" value={ex.name} onChange={e=>setFormData({...formData,exercises:formData.exercises.map((exi,j)=>j===i?{...exi,name:e.target.value}:exi)})} className="input flex-1" placeholder="Exercise name" required/>
                      <input type="number" value={ex.sets} onChange={e=>setFormData({...formData,exercises:formData.exercises.map((exi,j)=>j===i?{...exi,sets:parseInt(e.target.value)}:exi)})} className="input w-20" min="1" placeholder="Sets"/>
                      <input type="number" value={ex.reps} onChange={e=>setFormData({...formData,exercises:formData.exercises.map((exi,j)=>j===i?{...exi,reps:parseInt(e.target.value)}:exi)})} className="input w-20" min="1" placeholder="Reps"/>
                      <input type="number" step="0.1" value={ex.weight} onChange={e=>setFormData({...formData,exercises:formData.exercises.map((exi,j)=>j===i?{...exi,weight:e.target.value}:exi)})} className="input w-24" placeholder="Weight (lbs)"/>
                      <input type="number" value={ex.rest_seconds} onChange={e=>setFormData({...formData,exercises:formData.exercises.map((exi,j)=>j===i?{...exi,rest_seconds:parseInt(e.target.value)}:exi)})} className="input w-24" min="0" placeholder="Rest (sec)"/>
                      <button type="button" onClick={()=>removeExercise(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-3 bg-primary-50 rounded-lg">
                  <input type="text" value={exerciseForm.name} onChange={e=>setExerciseForm({...exerciseForm,name:e.target.value})} className="input sm:col-span-2" placeholder="Exercise name"/>
                  <input type="number" value={exerciseForm.sets} onChange={e=>setExerciseForm({...exerciseForm,sets:parseInt(e.target.value)})} className="input" min="1" placeholder="Sets"/>
                  <input type="number" value={exerciseForm.reps} onChange={e=>setExerciseForm({...exerciseForm,reps:parseInt(e.target.value)})} className="input" min="1" placeholder="Reps"/>
                  <input type="number" step="0.1" value={exerciseForm.weight} onChange={e=>setExerciseForm({...exerciseForm,weight:e.target.value})} className="input" placeholder="Weight"/>
                  <input type="number" value={exerciseForm.rest_seconds} onChange={e=>setExerciseForm({...exerciseForm,rest_seconds:parseInt(e.target.value)})} className="input" min="0" placeholder="Rest (sec)"/>
                  <button type="button" onClick={addExercise} className="btn-primary"><Plus className="w-4 h-4 mr-1"/>Add</button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-200"><button type="button" onClick={()=>setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={isLoading}>{isLoading?<Loader2 className="w-4 h-4 animate-spin"/>:(editingWorkout?'Update':'Create')}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}