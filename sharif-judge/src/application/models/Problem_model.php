<?php
/**
 * Sharif Judge online judge
 * @file Assignment_model.php
 * @author Mohammad Javad Naderi <mjnaderi@gmail.com>
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Problem_model extends CI_Model
{

	public function __construct()
	{
		parent::__construct();

		$this->load->model('problem_files_model');
	}

    public function new_problem_id(){
		$max = ($this->db->select_max('id', 'max_id')->get('problems')->row()->max_id) + 1;

		$assignments_root = rtrim($this->settings_model->get_setting('assignments_root'), '/');
		while (file_exists($assignments_root.'/problems/'.$max)){
			$max++;
		}

		return $max;
	}
	

	public function all_problems(){
		$result = $this->db->order_by('id', 'DESC')->select('id, name,admin_note, count(assignment_id) as no_of_assignment')
		->from('problems')
		->join('problem_assignment', 'problems.id = problem_assignment.problem_id', 'left')
		->group_by('id')
		->get()->result_array();
		$problems = array();
		foreach ($result as $item)
		{
			$problems[$item['id']] = $item;
		}
		
		return $problems;
	}
	public function all_problems_detailed(){
		$problem_language = $this->db->dbprefix('problem_language');
		$languages = $this->db->dbprefix('languages');
		$problem_assignment = $this->db->dbprefix('problem_assignment');
		$submissions = $this->db->dbprefix('submissions');
		$problems = array();
		$a =  $this->db
				->select("problems.id, problems.name, diff_cmd, diff_arg, admin_note, group_concat(distinct $languages.name SEPARATOR ', ') as languages, , group_concat(distinct $problem_assignment.assignment_id SEPARATOR ',') as assignments,"
					// ." count(distinct $problem_assignment.assignment_id) as no_of_ass,"
					//." count(distinct $submissions.submit_id) as no_of_sub "
				)
				->from('problems')
				->join('problem_language', 'problems.id = problem_language.problem_id', 'left')
				->join('languages', 'problem_language.language_id = languages.id', 'left')
				->join('problem_assignment', 'problems.id = problem_assignment.problem_id', 'left')
				// ->join('submissions', 'problems.id = submissions.problem_id', 'left')
				->group_by('problems.id')
				->order_by('problems.id', 'DESC')
				->get()
				->result_array()
				;
		

		foreach($a as &$prob){
			if ($prob['assignments'] != NULL)
				$prob['assignments'] = explode(',', $prob['assignments']);
		}
		return $a;
	
	}

	public function third_party_problems(){
		$problem_assignment = $this->db->dbprefix('problem_assignment');
		$problems =  $this->db
				->select("problems.id, problems.name, diff_cmd, diff_arg, admin_note, group_concat(distinct $problem_assignment.assignment_id SEPARATOR ',') as assignments,"
					// ." count(distinct $problem_assignment.assignment_id) as no_of_ass,"
					//." count(distinct $submissions.submit_id) as no_of_sub "
				)
				->from('problems')
				->join('problem_language', 'problems.id = problem_language.problem_id', 'left')
				->join('problem_assignment', 'problems.id = problem_assignment.problem_id', 'left')
				// ->join('submissions', 'problems.id = submissions.problem_id', 'left')
				->group_by('problems.id')
				->order_by('problems.id', 'DESC')
				->get()
				->result_array()
				;

		foreach($problems as &$prob){
			if ($prob['assignments'] != NULL)
			{
				$prob['assignments'] = explode(',', $prob['assignments']);
			}
			// Get content
			$prob = array_merge($prob, $this->problem_files_model->get_description($prob["id"]));
			// Get all languages for
			$prob['languages'] = $this->all_languages_array($prob["id"]);
		}
		return $problems;
	}

	public function problem_info($id = NULL){
		$a =  $this->db->get_where('problems', array('id' => $id))->row_array();
		if($a != NULL) $a['languages'] = $this->all_languages($id);
		return $a;
	}
	public function problem_info_detailed($id = NULL){
		$submissions = $this->db->dbprefix('submissions');
		$problem_assignment = $this->db->dbprefix('problem_assignment');

		$a =  $this->db
				->select("id, name"
					.", count(distinct $problem_assignment.assignment_id) as no_of_ass"
					.", count(distinct $submissions.submit_id) as no_of_sub "
				)
				->from('problems')
				->join('problem_assignment', 'problems.id = problem_assignment.problem_id', 'left')
				->join('submissions', 'problems.id = submissions.problem_id', 'left')
				->where(array('id' => $id))
				->group_by('problems.id')
				->get()->row_array();
		if($a != NULL) $a['languages'] = $this->all_languages($id);
		return $a;
	}

	public function all_languages($id = NULL){
		$query =  $this->db->from('languages')
						->join('problem_language', 'languages.id = problem_language.language_id')
						->where('problem_language.problem_id' , $id)
						->get()->result();
		$a = array();
		foreach($query as $lang){
			$a[$lang->id] = $lang;
		}
		return $a;
	}

	public function all_languages_array($id = NULL){
		return $this->db->from('languages')
			->join('problem_language', 'languages.id = problem_language.language_id')
			->where('problem_language.problem_id' , $id)
			->get()->result();
	}

	
	public function delete_problem($id){
		$cmd = 'rm -rf '.$this->problem_files_model->get_directory_path($id);
		//var_dump($cmd);die();
		$this->db->trans_start();

		// Phase 1: Delete this assignment and its submissions from database
		$this->db->delete('problems', array('id'=>$id));
		$this->db->delete('problem_language', array('problem_id'=>$id));
		$this->db->delete('problem_assignment', array('problem_id'=>$id));
		$this->db->delete('submissions', array('problem_id'=>$id));

		$this->db->trans_complete();

		if ($this->db->trans_status())
		{
			// Phase 2: Delete assignment's folder (all test cases and submitted codes)
			$cmd = 'rm -rf '.$this->problem_files_model->get_directory_path($id);

			shell_exec($cmd);
		}
	}

	// ------------------------------------------------------------------------
	/*
	* This function call the sql command replace in to problems
	* Use when editing or inserting problems
	*/
	public function replace_problem($problem_id = NULL){
		$this->db->trans_start();
		$id = $problem_id ? $problem_id : $this->new_problem_id();;
		
		//Now add new problems:
		$name = $this->input->post('problem_name');
		$admin_note = $this->input->post('admin_note');
		$dc = $this->input->post('diff_cmd');
		$da = $this->input->post('diff_arg');

		$problem = array(
			'id' => $id,
			'name' => $name,
			'admin_note' => $admin_note,
			'diff_cmd' => $dc,
			'diff_arg' => $da,
		);
		$this->db->replace('problems', $problem);
		
		$this->db->where('problem_id', $id)->delete('problem_language');

		$enable = $this->input->post('enable');
		$time_limit = $this->input->post('time_limit');
		$memory_limit = $this->input->post('memory_limit');
		foreach($this->input->post('language_id') as $i => $lang_id){
			if($enable[$i]){
				$this->db->insert('problem_language', array(
					'language_id' => $lang_id,
					'problem_id' => $id,
					'time_limit' => $time_limit[$i],
					'memory_limit' => $memory_limit[$i],
				));
			}
		}
		$this->db->trans_complete();
		return $id;
	}
}

?>